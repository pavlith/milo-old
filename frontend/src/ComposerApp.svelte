<script lang="ts">
  // Load offline icon data before anything else
  import './lib/iconify-offline'

  import { onMount, onDestroy } from 'svelte'
  import Icon from '@iconify/svelte'
  import Composer from './lib/components/composer/Composer.svelte'
  import ToastContainer from './lib/components/ui/toast/ToastContainer.svelte'
  import SpellSuggestionMenu from './lib/spellcheck/SpellSuggestionMenu.svelte'
  import { _ } from '$lib/i18n'
  import { createComposerWindowApi } from '$lib/composerApi'
  import { getShowTitleBar, getNativeTitleBar, setShowTitleBar, setNativeTitleBar, setDarkComposerBody } from '$lib/stores/settings.svelte'
  import { applyTheme } from '$lib/stores/theme.svelte'
  import { GetComposeMode, PrepareComposer, FinishComposer, KeepComposerOpen, GetThemeMode, GetShowTitleBar, GetNativeTitleBar, GetDarkComposerBody, NotifyStartupComplete } from '$bindings/github.com/hkdb/aerion/app/app'
  import { smtp, app } from '$lib/models'
  import { WindowMinimise, WindowToggleMaximise, WindowShow, WindowSetTitle, EventsOn, EventsOff } from '$lib/desktop'

  // Compose mode info from backend
  let composeMode = $state<app.ComposeMode | null>(null)
  let initialMessage = $state<smtp.ComposeMessage | null>(null)
  let loading = $state(true)
  let error = $state<string | null>(null)

  // Window state
  let isMaximized = $state(false)
  let isHovering = $state(false)

  // Close request state - triggers Composer's close dialog
  let closeRequested = $state(false)

  // Dynamic title parts from Composer
  let titleTo = $state('')
  let titleSubject = $state('')

  // Window title based on mode + dynamic recipient/subject
  let windowTitle = $derived(() => {
    if (!composeMode) return $_('sidebar.compose')
    let base: string
    switch (composeMode.mode) {
      case 'reply': base = $_('composer.reply'); break
      case 'reply-all': base = $_('composer.replyAll'); break
      case 'forward': base = $_('composer.forward'); break
      default: base = composeMode.draftId ? $_('composer.editDraft') : $_('composer.newMessage')
    }
    if (!titleTo && !titleSubject) return base
    const detail = titleTo && titleSubject
      ? `${titleTo} | ${titleSubject}`
      : titleTo || titleSubject
    return `${base} — ${detail}`
  })

  function handleTitleChange(to: string, subject: string) {
    titleTo = to
    titleSubject = subject
  }

  $effect(() => {
    WindowSetTitle(windowTitle())
  })

  onMount(async () => {
    // Subscribe first so an in-flight settings read cannot overwrite a newer IPC update.
    let receivedThemeChange = false
    EventsOn('theme:changed', (mode: string) => {
      receivedThemeChange = true
      applyTheme(mode)
    })

    // Load title bar settings so the composer respects the user's preference
    try {
      const [stb, ntb, dcb] = await Promise.all([GetShowTitleBar(), GetNativeTitleBar(), GetDarkComposerBody()])
      setShowTitleBar(stb ?? true)
      setNativeTitleBar(ntb ?? false)
      setDarkComposerBody(dcb ?? false)
    } catch (err) {
      console.error('Failed to load title bar settings:', err)
    }

    try {
      const mode = await GetThemeMode()
      if (!receivedThemeChange) applyTheme(mode)
    } catch (err) {
      console.error('Failed to load theme mode:', err)
    }

    // Show window after theme is applied (prevents white flash on startup)
    WindowShow()

    // Clear the desktop-environment startup indicator. Called after WindowShow()
    // so KDE/Plasma sees the placeholder → real window handoff cleanly (#154).
    NotifyStartupComplete()

    EventsOn('composer:close', requestClose)

    try {
      composeMode = await GetComposeMode()
      initialMessage = await PrepareComposer()
    } catch (err) {
      console.error('Failed to initialize composer:', err)
      error = String(err)
    } finally {
      loading = false
    }
  })

  onDestroy(() => {
    EventsOff('theme:changed')
    EventsOff('composer:close')
  })

  // Window control functions
  async function minimize() {
    await WindowMinimise()
  }

  async function toggleMaximize() {
    await WindowToggleMaximise()
    isMaximized = !isMaximized
  }

  // Request close - triggers Composer's close confirmation dialog
  function requestClose() {
    closeRequested = true
  }

  // Called when Composer has handled the close request (user made a choice)
  function handleCloseHandled() {
    closeRequested = false
  }

  // Handle composer close (after send or discard confirmation)
  function handleComposerClose() {
    void FinishComposer()
  }

  // Handle message sent
  function handleMessageSent() {
    // The Composer component shows its own toast
    // Close the window after a brief delay
    setTimeout(() => {
      void FinishComposer()
    }, 500)
  }
</script>

<div class="h-screen flex flex-col bg-background text-foreground">
  <!-- Custom Title Bar for frameless window -->
  {#if getShowTitleBar() && !getNativeTitleBar()}
    <header class="h-10 flex items-center justify-between bg-muted/50 border-b border-border select-none shrink-0">
      <!-- Drag region - left side with title -->
      <div class="flex-1 flex items-center gap-2 px-3 h-full" style="--wails-draggable: drag">
        <Icon icon="mdi:email-edit-outline" class="w-5 h-5 text-primary" />
        <span class="text-sm font-medium text-foreground">{windowTitle()}</span>
      </div>

      <!-- Mac-style traffic light controls -->
      <div
        class="flex items-center gap-2 px-3 h-full"
        role="group"
        aria-label={$_('aria.windowControls')}
        onmouseenter={() => isHovering = true}
        onmouseleave={() => isHovering = false}
      >
        <!-- Minimize (yellow) -->
        <button
          class="w-3 h-3 rounded-full flex items-center justify-center transition-all bg-[#FEBC2E] hover:brightness-90 active:brightness-75"
          onclick={minimize}
          title={$_('window.minimize')}
          aria-label={$_('aria.minimizeWindow')}
        >
          {#if isHovering}
            <span class="text-[10px] font-bold text-black/60 leading-none">−</span>
          {/if}
        </button>

        <!-- Maximize/Restore (green) -->
        <button
          class="w-3 h-3 rounded-full flex items-center justify-center transition-all bg-[#28C840] hover:brightness-90 active:brightness-75"
          onclick={toggleMaximize}
          title={isMaximized ? $_('window.restore') : $_('window.maximize')}
          aria-label={isMaximized ? $_('aria.restoreWindow') : $_('aria.maximizeWindow')}
        >
          {#if isHovering}
            <span class="text-[10px] font-bold text-black/60 leading-none">+</span>
          {/if}
        </button>

        <!-- Close (red) -->
        <button
          class="w-3 h-3 rounded-full flex items-center justify-center transition-all bg-[#FF5F57] hover:brightness-90 active:brightness-75"
          onclick={requestClose}
          title={$_('window.close')}
          aria-label={$_('aria.closeWindow')}
        >
          {#if isHovering}
            <span class="text-[10px] font-bold text-black/60 leading-none">×</span>
          {/if}
        </button>
      </div>
    </header>
  {/if}

  <!-- Main content -->
  <main class="flex-1 min-h-0 overflow-hidden">
    {#if loading}
      <div class="h-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" class="w-8 h-8 animate-spin text-primary" />
          <span class="text-sm text-muted-foreground">{$_('common.loading')}</span>
        </div>
      </div>
    {:else if error}
      <div class="h-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-3 text-center px-4">
          <Icon icon="mdi:alert-circle" class="w-12 h-12 text-destructive" />
          <p class="text-sm text-destructive">{error}</p>
          <button
            onclick={() => void FinishComposer()}
            class="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            {$_('window.closeWindow')}
          </button>
        </div>
      </div>
    {:else if composeMode}
      <Composer
        accountId={composeMode.accountId}
        initialMessage={initialMessage}
        draftId={composeMode.draftId || null}
        messageId={composeMode.messageId || null}
        onClose={handleComposerClose}
        onSent={handleMessageSent}
        api={createComposerWindowApi()}
        isDetached={true}
        closeRequested={closeRequested}
        onCloseHandled={handleCloseHandled}
        onKeepEditing={() => void KeepComposerOpen()}
        onTitleChange={handleTitleChange}
      />
    {/if}
  </main>
</div>

<!-- Toast notifications -->
<ToastContainer />

<!-- Spellcheck right-click suggestion menu -->
<SpellSuggestionMenu />

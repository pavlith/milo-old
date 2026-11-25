<script lang="ts">
  import { ModeWatcher } from 'mode-watcher'
  import * as Tooltip from '$lib/components/ui/tooltip'
  // Load offline icon data before anything else
  import './lib/iconify-offline'

  import { onMount, onDestroy } from 'svelte'
  import { Button } from '$lib/components/ui/button'
  import Icon from '@iconify/svelte'
  import TitleBar from '$lib/components/common/TitleBar.svelte'
  import Composer from './lib/components/composer/Composer.svelte'
  import ToastContainer from './lib/components/ui/toast/ToastContainer.svelte'
  import SpellSuggestionMenu from './lib/spellcheck/SpellSuggestionMenu.svelte'
  import { _ } from '$lib/i18n'
  import { createComposerWindowApi } from '$lib/composerApi'
  import { getShowTitleBar, getNativeTitleBar, setShowTitleBar, setNativeTitleBar, setDarkComposerBody, setComposerFormat } from '$lib/stores/settings.svelte'
  import { applyTheme, COMPOSER_MODE_STORAGE_KEY } from '$lib/stores/theme.svelte'
  import { GetComposeMode, PrepareComposer, FinishComposer, KeepComposerOpen, GetThemeMode, GetShowTitleBar, GetNativeTitleBar, GetDarkComposerBody, GetComposerFormat, NotifyStartupComplete } from '$bindings/github.com/pavlith/milo/app/app'
  import { smtp, app } from '$lib/models'
  import { WindowShow, WindowSetTitle, EventsOn, EventsOff } from '$lib/desktop'

  // Compose mode info from backend
  let composeMode = $state<app.ComposeMode | null>(null)
  let initialMessage = $state<smtp.ComposeMessage | null>(null)
  let loading = $state(true)
  let error = $state<string | null>(null)

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
    WindowSetTitle(`${windowTitle()} — Milo`)
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

    // Composer reads this preference once when it mounts.
    try {
      setComposerFormat(await GetComposerFormat() === 'plain' ? 'plain' : 'rich')
    } catch (err) {
      console.error('Failed to load composer format:', err)
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

<ModeWatcher modeStorageKey={COMPOSER_MODE_STORAGE_KEY} disableHeadScriptInjection synchronousModeChanges />

<Tooltip.Provider delayDuration={0}>
  <div class="h-screen flex flex-col bg-background text-foreground">
    <!-- Custom Title Bar for frameless window -->
    {#if getShowTitleBar() && !getNativeTitleBar()}
      <TitleBar title={windowTitle()} onClose={requestClose} />
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
            <Button variant="secondary" size="sm" onclick={() => void FinishComposer()}>
              {$_('window.closeWindow')}
            </Button>
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
</Tooltip.Provider>

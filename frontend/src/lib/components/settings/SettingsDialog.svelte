<script lang="ts">
  import { untrack } from 'svelte'
  import Icon from '@iconify/svelte'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Button } from '$lib/components/ui/button'
  import { GetReadReceiptResponsePolicy, SetReadReceiptResponsePolicy, GetMarkAsReadDelay, SetMarkAsReadDelay, GetMessageListDensity, SetMessageListDensity, SetThemeMode, GetShowTitleBar, SetShowTitleBar, GetRunBackground, SetRunBackground, GetStartHidden, SetStartHidden, GetAutostart, SetAutostart, SetLanguage, GetComposerMode, SetComposerMode, GetMailtoMode, SetMailtoMode, GetComposerFormat, SetComposerFormat, GetNativeTitleBar, SetNativeTitleBar, GetAlwaysLoadImages, SetAlwaysLoadImages, GetDarkMailContent, SetDarkMailContent, GetDarkComposerBody, SetDarkComposerBody, GetAccentBarUnread, SetAccentBarUnread, GetAccentUnreadStyle, SetAccentUnreadStyle, GetShowMessageListCircles, SetShowMessageListCircles, GetShowMessageListProfilePics, SetShowMessageListProfilePics, GetAlwaysShowMessageCheckbox, SetAlwaysShowMessageCheckbox, GetShowViewerCircles, SetShowViewerCircles, GetSpellcheckEnabled, SetSpellcheckEnabled, GetSpellcheckLanguages, SetSpellcheckLanguages, QuitApp } from '$bindings/github.com/hkdb/aerion/app/app'
  import { addToast } from '$lib/stores/toast'
  import { getThemeMode, setMessageListDensity as updateDensityStore, setThemeMode as updateThemeStore, setShowTitleBar as updateShowTitleBarStore, setRunBackground as updateRunBackgroundStore, setStartHidden as updateStartHiddenStore, setAutostart as updateAutostartStore, setComposerMode as updateComposerModeStore, setMailtoMode as updateMailtoModeStore, setComposerFormat as updateComposerFormatStore, setNativeTitleBar as updateNativeTitleBarStore, setAlwaysLoadImages as updateAlwaysLoadImagesStore, setDarkMailContent as updateDarkMailContentStore, setDarkComposerBody as updateDarkComposerBodyStore, setAccentBarUnread as updateAccentBarUnreadStore, setAccentUnreadStyle as updateAccentUnreadStyleStore, setShowMessageListCircles as updateShowMessageListCirclesStore, setShowMessageListProfilePics as updateShowMessageListProfilePicsStore, setAlwaysShowMessageCheckbox as updateAlwaysShowMessageCheckboxStore, setShowViewerCircles as updateShowViewerCirclesStore, setSpellcheckEnabled as updateSpellcheckEnabledStore, setSpellcheckLanguages as updateSpellcheckLanguagesStore, type MessageListDensity, type ComposerMode, type ComposerFormat } from '$lib/stores/settings.svelte'
  import { syncSpellcheckLanguagesIfActive, defaultSpellcheckLanguages } from '$lib/spellcheck/settings'
  import { applyTheme, DEFAULT_THEME_MODE, type ThemeMode } from '$lib/stores/theme.svelte'
  import { dialogGuardOpen, dialogGuardClose } from '$lib/stores/dialogGuard'
  import { _, isSupportedLocale, locale, setLocale } from '$lib/i18n'
  import ConfirmDialog from '$lib/components/ui/confirm-dialog/ConfirmDialog.svelte'
  import GeneralTab from './GeneralTab.svelte'
  import ComposerTab from './ComposerTab.svelte'
  import ImagesTab from './ImagesTab.svelte'
  import AccountsTab from './AccountsTab.svelte'
  import ContactsTab from './ContactsTab.svelte'
  import ExtensionsTab from './ExtensionsTab.svelte'
  import AboutTab from './AboutTab.svelte'

  interface Props {
    /** Whether the dialog is open */
    open?: boolean
    /** Callback when dialog should close */
    onClose?: () => void
  }

  let {
    open = $bindable(false),
    onClose,
  }: Props = $props()

  // Settings state
  let readReceiptResponsePolicy = $state<string>('ask')
  let markAsReadDelaySeconds = $state<number>(1) // Display in seconds, store in ms
  let messageListDensity = $state<string>('standard')
  let themeMode = $state<ThemeMode>(DEFAULT_THEME_MODE)
  let showTitleBar = $state<boolean>(true)
  let runBackground = $state<boolean>(false)
  let startHidden = $state<boolean>(false)
  let autostart = $state<boolean>(false)
  let language = $state<string>('')
  let composerMode = $state<string>('inline')
  let mailtoMode = $state<string>('inline')
  let composerFormat = $state<string>('rich')
  let spellcheckEnabled = $state<boolean>(true)
  let spellcheckLanguages = $state<string[]>([])
  let nativeTitleBar = $state<boolean>(false)
  let alwaysLoadImages = $state<boolean>(false)
  let darkMailContent = $state<boolean>(false)
  let darkComposerBody = $state<boolean>(false)
  let accentBarUnread = $state<boolean>(false)
  let accentUnreadStyle = $state<string>('dot')
  let showMessageListCircles = $state<boolean>(true)
  let showMessageListProfilePics = $state<boolean>(false)
  let alwaysShowMessageCheckbox = $state<boolean>(false)
  let showViewerCircles = $state<boolean>(true)
  let originalNativeTitleBar = false
  let showRestartDialog = $state(false)
  let loading = $state(true)
  let saving = $state(false)
  let activeTab = $state('general')

  function previewTheme(mode: ThemeMode) {
    themeMode = mode
    applyTheme(mode)
  }

  $effect(() => {
    if (open) untrack(loadSettings)
  })

  // Activate the dialog guard while open: suppresses background refreshes
  // and routes global keyboard shortcuts (e.g. Ctrl+A) to the dialog inputs
  // instead of the message list / viewer behind it.
  $effect(() => {
    if (open) {
      dialogGuardOpen()
      return () => dialogGuardClose()
    }
  })

  async function loadSettings() {
    loading = true
    themeMode = getThemeMode()
    try {
      const [policy, delayMs, density, titleBar, runBg, startHid, autoSt, comp, mail, compFmt, nativeTB, alwaysImages, darkMail, darkComposer, accentBar, accentStyle, listCircles, listProfilePics, alwaysCheckbox, viewerCircles, scEnabled, scLangs] = await Promise.all([
        GetReadReceiptResponsePolicy(),
        GetMarkAsReadDelay(),
        GetMessageListDensity(),
        GetShowTitleBar(),
        GetRunBackground(),
        GetStartHidden(),
        GetAutostart(),
        GetComposerMode(),
        GetMailtoMode(),
        GetComposerFormat(),
        GetNativeTitleBar(),
        GetAlwaysLoadImages(),
        GetDarkMailContent(),
        GetDarkComposerBody(),
        GetAccentBarUnread(),
        GetAccentUnreadStyle(),
        GetShowMessageListCircles(),
        GetShowMessageListProfilePics(),
        GetAlwaysShowMessageCheckbox(),
        GetShowViewerCircles(),
        GetSpellcheckEnabled(),
        GetSpellcheckLanguages(),
      ])
      readReceiptResponsePolicy = policy
      // Convert ms to seconds for display
      markAsReadDelaySeconds = delayMs < 0 ? -1 : delayMs / 1000
      messageListDensity = density
      showTitleBar = titleBar
      runBackground = runBg
      startHidden = startHid
      autostart = autoSt
      language = $locale ?? 'en'
      composerMode = comp || 'inline'
      mailtoMode = mail || 'inline'
      composerFormat = compFmt || 'rich'
      spellcheckEnabled = scEnabled ?? true
      // Empty stored list = "use defaults" — show the same set the engine uses.
      spellcheckLanguages = (scLangs && scLangs.length) ? scLangs : defaultSpellcheckLanguages()
      nativeTitleBar = nativeTB ?? false
      alwaysLoadImages = alwaysImages ?? false
      darkMailContent = darkMail ?? false
      darkComposerBody = darkComposer ?? false
      accentBarUnread = accentBar ?? false
      accentUnreadStyle = accentStyle || 'dot'
      showMessageListCircles = listCircles ?? true
      showMessageListProfilePics = listProfilePics ?? false
      alwaysShowMessageCheckbox = alwaysCheckbox ?? false
      showViewerCircles = viewerCircles ?? true
      originalNativeTitleBar = nativeTitleBar
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      loading = false
    }
  }

  async function handleSave() {
    saving = true
    try {
      // Convert seconds to ms for storage
      const delayMs = markAsReadDelaySeconds < 0 ? -1 : Math.round(markAsReadDelaySeconds * 1000)

      // Save settings sequentially to avoid SQLite lock conflicts
      await SetReadReceiptResponsePolicy(readReceiptResponsePolicy)
      await SetMarkAsReadDelay(delayMs)
      await SetMessageListDensity(messageListDensity)
      await SetShowTitleBar(showTitleBar)
      await SetRunBackground(runBackground)
      await SetStartHidden(startHidden)
      await SetAutostart(autostart)
      await SetComposerMode(composerMode)
      await SetMailtoMode(mailtoMode)
      await SetComposerFormat(composerFormat)
      await SetSpellcheckEnabled(spellcheckEnabled)
      await SetSpellcheckLanguages(spellcheckLanguages)
      await SetNativeTitleBar(nativeTitleBar)
      await SetAlwaysLoadImages(alwaysLoadImages)
      await SetDarkMailContent(darkMailContent)
      await SetDarkComposerBody(darkComposerBody)
      await SetAccentBarUnread(accentBarUnread)
      await SetAccentUnreadStyle(accentUnreadStyle)
      await SetShowMessageListCircles(showMessageListCircles)
      await SetShowMessageListProfilePics(showMessageListProfilePics)
      await SetAlwaysShowMessageCheckbox(alwaysShowMessageCheckbox)
      await SetShowViewerCircles(showViewerCircles)
      const selectedTheme = themeMode
      await SetThemeMode(selectedTheme)
      updateThemeStore(selectedTheme)
      // Update the reactive stores so UI updates immediately
      updateDensityStore(messageListDensity as MessageListDensity)
      updateShowTitleBarStore(showTitleBar)
      updateRunBackgroundStore(runBackground)
      updateStartHiddenStore(startHidden)
      updateAutostartStore(autostart)
      if (isSupportedLocale(language) && language !== $locale) {
        await SetLanguage(language)
        await setLocale(language)
      }
      updateComposerModeStore(composerMode as ComposerMode)
      updateMailtoModeStore(mailtoMode as ComposerMode)
      updateComposerFormatStore(composerFormat as ComposerFormat)
      updateSpellcheckEnabledStore(spellcheckEnabled)
      updateSpellcheckLanguagesStore(spellcheckLanguages)
      syncSpellcheckLanguagesIfActive() // live-apply to an open composer; stays lazy otherwise
      updateNativeTitleBarStore(nativeTitleBar)
      updateAlwaysLoadImagesStore(alwaysLoadImages)
      updateDarkMailContentStore(darkMailContent)
      updateDarkComposerBodyStore(darkComposerBody)
      updateAccentBarUnreadStore(accentBarUnread)
      updateAccentUnreadStyleStore(accentUnreadStyle)
      updateShowMessageListCirclesStore(showMessageListCircles)
      updateShowMessageListProfilePicsStore(showMessageListProfilePics)
      updateAlwaysShowMessageCheckboxStore(alwaysShowMessageCheckbox)
      updateShowViewerCirclesStore(showViewerCircles)
      addToast({
        type: 'success',
        message: $_('toast.settingsSaved'),
      })
      // Show restart dialog if native title bar setting changed
      if (nativeTitleBar !== originalNativeTitleBar) {
        originalNativeTitleBar = nativeTitleBar
        showRestartDialog = true
        return
      }
      open = false
      onClose?.()
    } catch (err) {
      console.error('Failed to save settings:', err)
      addToast({
        type: 'error',
        message: $_('toast.failedToSaveSettings'),
      })
    } finally {
      saving = false
    }
  }

  function handleCancel() {
    applyTheme(getThemeMode())
    open = false
    onClose?.()
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen
    if (!isOpen) {
      applyTheme(getThemeMode())
      onClose?.()
    }
  }
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content class="flex max-h-[calc(100dvh-1rem)] max-w-3xl flex-col gap-3 p-4 sm:p-6" preventCloseAutoFocus onInteractOutside={(e) => e.preventDefault()}>
    <Dialog.Header>
      <Dialog.Title>{$_('settings.title')}</Dialog.Title>
      <Dialog.Description>
        {$_('settings.description')}
      </Dialog.Description>
    </Dialog.Header>

    {#if loading}
      <span class="sr-only" role="status">{$_('common.loading')}</span>
      <Skeleton class="h-9 w-full" />
      <Skeleton class="h-32 w-full" />
    {:else}
      <Tabs.Root bind:value={activeTab} class="flex min-h-0 w-full flex-col">
        <Tabs.List class="h-auto w-full shrink-0 flex-wrap justify-start gap-1">
          <Tabs.Trigger value="general" class="flex items-center gap-2">
            <Icon icon="lucide:settings-2" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.general')}
          </Tabs.Trigger>
          <Tabs.Trigger value="composer" class="flex items-center gap-2">
            <Icon icon="lucide:square-pen" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.composer')}
          </Tabs.Trigger>
          <Tabs.Trigger value="images" class="flex items-center gap-2">
            <Icon icon="lucide:image" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.images')}
          </Tabs.Trigger>
          <Tabs.Trigger value="accounts" class="flex items-center gap-2">
            <Icon icon="lucide:mails" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.accounts')}
          </Tabs.Trigger>
          <Tabs.Trigger value="contacts" class="flex items-center gap-2">
            <Icon icon="lucide:contact" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.contacts')}
          </Tabs.Trigger>
          <Tabs.Trigger value="extensions" class="flex items-center gap-2">
            <Icon icon="lucide:puzzle" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.extensions')}
          </Tabs.Trigger>
          <Tabs.Trigger value="about" class="flex items-center gap-2">
            <Icon icon="lucide:info" class="size-4 shrink-0" aria-hidden="true" />
            {$_('settings.about')}
          </Tabs.Trigger>
        </Tabs.List>

        <div class="mt-3 h-88 min-h-0 overflow-y-auto px-1 sm:pr-3">
          <Tabs.Content value="general" class="mt-0">
            <GeneralTab
              bind:markAsReadDelaySeconds
              bind:messageListDensity
              {themeMode}
              themeDisabled={saving}
              bind:nativeTitleBar
              bind:showTitleBar
              bind:runBackground
              bind:startHidden
              bind:autostart
              bind:language
              onDelayChange={(v) => markAsReadDelaySeconds = v}
              onDensityChange={(v) => messageListDensity = v}
              onThemeChange={previewTheme}
              onTitleBarChange={(ntb, stb) => { nativeTitleBar = ntb; showTitleBar = stb }}
              onRunBackgroundChange={(v) => { runBackground = v; if (!v) startHidden = false }}
              onStartHiddenChange={(v) => { startHidden = v; if (v) runBackground = true }}
              onAutostartChange={(v) => autostart = v}
              bind:accentBarUnread
              bind:accentUnreadStyle
              bind:showMessageListCircles
              bind:showMessageListProfilePics
              bind:alwaysShowMessageCheckbox
              bind:showViewerCircles
              bind:darkMailContent
              bind:darkComposerBody
            />
          </Tabs.Content>

          <Tabs.Content value="composer" class="mt-0">
            <ComposerTab
              bind:composerMode
              bind:mailtoMode
              bind:composerFormat
              bind:readReceiptResponsePolicy
              bind:spellcheckEnabled
              bind:spellcheckLanguages
              onComposerModeChange={(v) => { composerMode = v; if (v === 'detached') mailtoMode = 'detached' }}
              onMailtoModeChange={(v) => mailtoMode = v}
              onFormatChange={(v) => composerFormat = v}
              onPolicyChange={(v) => readReceiptResponsePolicy = v}
              onSpellcheckEnabledChange={(v) => spellcheckEnabled = v}
              onSpellcheckLanguagesChange={(v) => spellcheckLanguages = v}
            />
          </Tabs.Content>

          <Tabs.Content value="images" class="mt-0">
            <ImagesTab
              bind:alwaysLoadImages
              onAlwaysLoadImagesChange={(v) => alwaysLoadImages = v}
            />
          </Tabs.Content>

          <Tabs.Content value="accounts" class="mt-0">
            <AccountsTab />
          </Tabs.Content>

          <Tabs.Content value="contacts" class="mt-0">
            <ContactsTab />
          </Tabs.Content>

          <Tabs.Content value="extensions" class="mt-0">
            <ExtensionsTab />
          </Tabs.Content>

          <Tabs.Content value="about" class="mt-0">
            <AboutTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <!-- Actions - show Save/Cancel on General and Composer tabs -->
      {#if activeTab === 'general' || activeTab === 'composer' || activeTab === 'images'}
        <Dialog.Footer class="shrink-0 flex-row justify-end gap-2 border-t pt-3 sm:space-x-0">
          <Button variant="ghost" onclick={handleCancel} disabled={saving}>
            {$_('common.cancel')}
          </Button>
          <Button onclick={handleSave} disabled={saving}>
            {#if saving}
              <Icon icon="mdi:loading" class="w-4 h-4 mr-2 animate-spin" />
            {/if}
            {$_('common.save')}
          </Button>
        </Dialog.Footer>
      {:else}
        <Dialog.Footer class="shrink-0 flex-row justify-end gap-2 border-t pt-3 sm:space-x-0">
          <Button variant="ghost" onclick={handleCancel}>
            {$_('common.close')}
          </Button>
        </Dialog.Footer>
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>

<ConfirmDialog
  bind:open={showRestartDialog}
  title={$_('settingsGeneral.restartRequired')}
  description={$_('settingsGeneral.restartRequiredDescription')}
  confirmLabel={$_('settingsGeneral.quitNow')}
  cancelLabel={$_('settingsGeneral.restartLater')}
  onConfirm={() => QuitApp()}
  onCancel={() => { showRestartDialog = false; open = false; onClose?.() }}
/>

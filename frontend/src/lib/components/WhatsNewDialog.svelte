<script lang="ts">
  // Per-version release announcement. Shown once after the user upgrades
  // to a new Aerion version. Only the explicit OK click records
  // acknowledgement (via onAcknowledge → SetLastSeenVersion in App.svelte).
  // Closing via ESC or outside-click leaves the version unrecorded, so
  // the dialog fires again on next launch.
  //
  // Per-release update workflow: bump Version in app/state.go, then edit
  // the body markup below to be the new release announcement.
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button } from '$lib/components/ui/button'
  import { OpenURL } from '$bindings/github.com/hkdb/aerion/app/app'
  import { _ } from '$lib/i18n'
  import { dialogGuardOpen, dialogGuardClose } from '$lib/stores/dialogGuard'

  interface Props {
    open: boolean
    onAcknowledge: () => void
  }

  let { open = $bindable(false), onAcknowledge }: Props = $props()

  // Hold the dialog guard while open so global shortcuts (Ctrl+, etc.) don't
  // fire behind this modal. Effect cleanup releases it on close and on
  // unmount-while-open (same pattern as ConfirmDialog).
  $effect(() => {
    if (!open) return
    dialogGuardOpen()
    return () => dialogGuardClose()
  })

  const CHANGELOG_URL = 'https://github.com/hkdb/aerion/blob/main/CHANGELOG.md'

  // Open external links via the backend OpenURL: on Linux it tries the OpenURI
  // portal first for native desktop integration (xdg-open —
  // and thus Wails' BrowserOpenURL — can't reach the host browser).
  function openExternal(url: string) {
    OpenURL(url).catch((err: unknown) => console.error('Failed to open URL:', err))
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content showCloseButton={false} class="gap-6 p-8">
    <Dialog.Header>
      <Dialog.Title>
        What's new?
      </Dialog.Title>
    </Dialog.Header>

    <div class="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
      <p>🚀 Welcome to Aerion v0.3.6!</p>

      <p>v0.3.6 is mostly a maintenance release. Here are the highlights of the release:</p>

      <ul class="list-disc pl-6 space-y-1">
        <li>⚗️ Scheduled Sync reworked</li>
        <li>📖 Translations added for Portuguese (BR), Japanese, and Turkish</li>
        <li>✅ Added Turkish spellcheck</li>
        <li>✏️ Signature edit and render improvements</li>
        <li>🐛 Bug fixes and other improvements</li>
      </ul>

      <p>🏷 See the full change log here:</p>

      <p>
        <button
          type="button"
          class="text-primary hover:underline break-all focus:outline-hidden focus-visible:outline-hidden focus:ring-0"
          onclick={() => openExternal(CHANGELOG_URL)}
        >
          https://github.com/hkdb/aerion/blob/main/CHANGELOG.md
        </button>
      </p>
    </div>

    <Dialog.Footer>
      <Button onclick={onAcknowledge}>{$_('common.ok')}</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

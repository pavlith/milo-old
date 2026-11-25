<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button } from '$lib/components/ui/button'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import { BrowserOpenURL } from '$lib/desktop'
  import { _ } from '$lib/i18n'
  import { dialogGuardOpen, dialogGuardClose } from '$lib/stores/dialogGuard'

  interface Props {
    open: boolean
    onAccept: () => void
  }

  let { open = $bindable(false), onAccept }: Props = $props()

  // Hold the dialog guard while open so global shortcuts (Ctrl+, etc.) don't
  // fire behind this modal. Effect cleanup releases it on close and on
  // unmount-while-open (same pattern as ConfirmDialog).
  $effect(() => {
    if (!open) return
    dialogGuardOpen()
    return () => dialogGuardClose()
  })

  let agreed = $state(false)

  const PRIVACY_URL = 'https://github.com/pavlith/milo/blob/main/docs/PRIVACY.md'
  const TERMS_URL = 'https://github.com/pavlith/milo/blob/main/docs/TERMS.md'

  function openPrivacyPolicy() {
    BrowserOpenURL(PRIVACY_URL)
  }

  function openTermsOfService() {
    BrowserOpenURL(TERMS_URL)
  }

  function handleAccept() {
    if (agreed) {
      onAccept()
    }
  }

  function preventClose(e: Event) {
    e.preventDefault()
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content showCloseButton={false} class="gap-6 p-8" onInteractOutside={preventClose}>
    <!-- Header -->
    <Dialog.Header>
      <Dialog.Title>
        {$_('terms.title')}
      </Dialog.Title>
      <Dialog.Description>
        {$_('terms.description')}
      </Dialog.Description>
    </Dialog.Header>

    <!-- Content -->
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        {$_('terms.content')}
      </p>

      <div class="flex flex-col gap-2">
        <button
          type="button"
          onclick={openPrivacyPolicy}
          class="text-sm text-primary hover:underline text-left flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {$_('terms.privacyPolicy')}
        </button>
        <button
          type="button"
          onclick={openTermsOfService}
          class="text-sm text-primary hover:underline text-left flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {$_('terms.termsOfUse')}
        </button>
      </div>

      <!-- Toggle -->
      <div class="flex items-center gap-3">
        <Switch
          bind:checked={agreed}
          id="agree-terms"
        />
        <label for="agree-terms" class="text-sm cursor-pointer">
          {$_('terms.agreeLabel')}
        </label>
      </div>
    </div>

    <!-- Footer -->
    <Dialog.Footer>
      <Button onclick={handleAccept} disabled={!agreed}>
        {$_('terms.accept')}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

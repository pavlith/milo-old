<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui'
  import { cn, type WithoutChild, type WithoutChildrenOrChild } from '$lib/utils'
  import { _ } from '$lib/i18n'
  import Icon from '@iconify/svelte'
  import DialogOverlay from './dialog-overlay.svelte'

  type Props = Omit<WithoutChild<DialogPrimitive.ContentProps>, 'preventScroll'> & {
    portalProps?: WithoutChildrenOrChild<DialogPrimitive.PortalProps>
    overlayClass?: string
    showCloseButton?: boolean
    preventCloseAutoFocus?: boolean
  }

  let {
    ref = $bindable(null),
    class: className,
    children,
    portalProps,
    overlayClass,
    showCloseButton = true,
    preventCloseAutoFocus = false,
    onCloseAutoFocus,
    ...restProps
  }: Props = $props()

  function handleCloseAutoFocus(e: Event) {
    if (preventCloseAutoFocus) e.preventDefault()
    onCloseAutoFocus?.(e)
  }
</script>

<DialogPrimitive.Portal {...portalProps}>
  <DialogOverlay class={overlayClass} />
  <!-- The fixed-height layout uses the overlay to block clicks. Body scroll locking
       can leave pointer-events disabled after chained dialogs (#448). -->
  <DialogPrimitive.Content
    bind:ref
    data-slot="dialog-content"
    preventScroll={false}
    onCloseAutoFocus={handleCloseAutoFocus}
    class={cn(
      'fixed left-1/2 top-1/2 z-50 grid w-full min-w-0 max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg outline-hidden sm:rounded-lg',
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <DialogPrimitive.Close
        data-slot="dialog-close"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none"
      >
        <Icon icon="mdi:close" class="size-4" aria-hidden="true" />
        <span class="sr-only">{$_('common.close')}</span>
      </DialogPrimitive.Close>
    {/if}
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>

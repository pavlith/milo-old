<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui'
  import { cn, type WithoutChild, type WithoutChildrenOrChild } from '$lib/utils'
  import DialogOverlay from '../dialog/dialog-overlay.svelte'

  type Props = Omit<WithoutChild<AlertDialogPrimitive.ContentProps>, 'preventScroll'> & {
    portalProps?: WithoutChildrenOrChild<AlertDialogPrimitive.PortalProps>
    preventCloseAutoFocus?: boolean
  }

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    preventCloseAutoFocus = false,
    onCloseAutoFocus,
    ...restProps
  }: Props = $props()

  function handleCloseAutoFocus(e: Event) {
    if (preventCloseAutoFocus) e.preventDefault()
    onCloseAutoFocus?.(e)
  }
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
  <DialogOverlay data-slot="alert-dialog-overlay" />
  <!-- Keep body scroll locking disabled for nested or chained dialogs (#448). -->
  <AlertDialogPrimitive.Content
    bind:ref
    data-slot="alert-dialog-content"
    preventScroll={false}
    onCloseAutoFocus={handleCloseAutoFocus}
    class={cn(
      'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-sm outline-hidden sm:rounded-lg [&>*]:min-w-0',
      className
    )}
    {...restProps}
  />
</AlertDialogPrimitive.Portal>

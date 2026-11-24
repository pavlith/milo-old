<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import { buttonVariants, type ButtonSize, type ButtonVariant } from '../button'

  type Props = AlertDialogPrimitive.CancelProps & {
    variant?: ButtonVariant
    size?: ButtonSize
  }

  let {
    ref = $bindable(null),
    class: className,
    variant = 'outline',
    size,
    ...restProps
  }: Props = $props()
</script>

<AlertDialogPrimitive.Cancel
  bind:ref
  data-slot="alert-dialog-cancel"
  class={cn(buttonVariants({ variant, size }), 'mt-2 sm:mt-0', className)}
  {...restProps}
/>

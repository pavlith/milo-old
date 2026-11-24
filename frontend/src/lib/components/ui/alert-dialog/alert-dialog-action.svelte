<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import { buttonVariants, type ButtonSize, type ButtonVariant } from '../button'

  type Props = AlertDialogPrimitive.ActionProps & {
    variant?: ButtonVariant
    size?: ButtonSize
  }

  let {
    ref = $bindable(null),
    class: className,
    variant = 'default',
    size,
    ...restProps
  }: Props = $props()
</script>

<AlertDialogPrimitive.Action
  bind:ref
  data-slot="alert-dialog-action"
  class={cn(buttonVariants({ variant, size }), className)}
  {...restProps}
/>

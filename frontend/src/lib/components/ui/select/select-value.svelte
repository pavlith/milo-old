<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn, type WithoutChild } from '$lib/utils'

  let {
    ref = $bindable(null),
    placeholder = 'Select...',
    class: className,
    ...restProps
  }: WithoutChild<SelectPrimitive.ValueProps> = $props()
</script>

<SelectPrimitive.Value
  bind:ref
  data-slot="select-value"
  {placeholder}
  class={cn('block truncate', className)}
  {...restProps}
/>

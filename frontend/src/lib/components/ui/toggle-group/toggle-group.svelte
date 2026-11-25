<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: Extract<ToggleGroupPrimitive.RootProps, { type: 'single' }> = $props()
</script>

<ToggleGroupPrimitive.Root
  bind:ref
  bind:value
  data-slot="toggle-group"
  class={cn('inline-flex w-fit items-center gap-0.5 rounded-md border bg-background p-0.5', className)}
  {...restProps}
/>

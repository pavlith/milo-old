<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
  import { buttonVariants } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'

  let { ref = $bindable(null), class: className, ...restProps }: ToggleGroupPrimitive.ItemProps = $props()
</script>

<ToggleGroupPrimitive.Item
  bind:ref
  data-slot="toggle-group-item"
  class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }),
    'h-7 px-2 text-xs data-[state=on]:bg-accent data-[state=on]:text-accent-foreground', className)}
  {...restProps}
/>

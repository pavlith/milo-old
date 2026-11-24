<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'

  let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props()
</script>

<TabsPrimitive.List
  bind:ref
  data-slot="tabs-list"
  class={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground group-data-[orientation=vertical]/tabs:h-auto group-data-[orientation=vertical]/tabs:flex-col', className)}
  {...restProps}
/>

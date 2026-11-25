<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    children,
    collapsible = 'none',
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & { collapsible?: 'none' } = $props()
</script>

<div
  bind:this={ref}
  data-sidebar="sidebar"
  data-slot="sidebar"
  data-collapsible={collapsible}
  class={cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', className)}
  {...restProps}
>
  {@render children?.()}
</div>

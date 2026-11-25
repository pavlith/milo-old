<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { cn, type WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    style,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props()
</script>

<Tooltip.Provider delayDuration={300}>
  <div
    data-slot="sidebar-wrapper"
    style="--sidebar-width: 15rem; --sidebar-width-icon: 3rem; {style ?? ''}"
    class={cn('group/sidebar-wrapper flex w-full', className)}
    bind:this={ref}
    {...restProps}
  >
    {@render children?.()}
  </div>
</Tooltip.Provider>

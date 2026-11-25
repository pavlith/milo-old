<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { WithoutChildrenOrChild } from '$lib/utils'
  import TooltipPortal from './tooltip-portal.svelte'
  import type { ComponentProps } from 'svelte'

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 0,
    side = 'top',
    children,
    arrowClasses,
    portalProps,
    ...restProps
  }: TooltipPrimitive.ContentProps & {
    arrowClasses?: string
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>
  } = $props()
</script>

<TooltipPortal {...portalProps}>
  <TooltipPrimitive.Content
    bind:ref
    data-slot="tooltip-content"
    {sideOffset}
    {side}
    class={cn(
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm z-50 w-fit max-w-xs origin-(--bits-tooltip-content-transform-origin) bg-tooltip text-tooltip-foreground',
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    <TooltipPrimitive.Arrow>
      {#snippet child({ props })}
        <!-- Like Radix: the wrapper takes the popper transforms, only the inner square rotates. -->
        <div {...props}>
          <div
            class={cn(
              'size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] z-50 translate-y-[calc(-50%_-_2px)] bg-tooltip',
              arrowClasses
            )}
            data-side={props['data-side']}
          ></div>
        </div>
      {/snippet}
    </TooltipPrimitive.Arrow>
  </TooltipPrimitive.Content>
</TooltipPortal>

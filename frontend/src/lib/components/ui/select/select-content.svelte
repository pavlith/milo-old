<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import Icon from '@iconify/svelte'
  import { cn, type WithoutChild, type WithoutChildrenOrChild } from '$lib/utils'

  type Props = WithoutChild<SelectPrimitive.ContentProps> & {
    position?: 'popper' | 'item-aligned'
    portalProps?: WithoutChildrenOrChild<SelectPrimitive.PortalProps>
  }

  let {
    ref = $bindable(null),
    class: className,
    children,
    position = 'popper',
    side = 'bottom',
    sideOffset = 4,
    align = 'start',
    portalProps,
    preventScroll = false,
    ...restProps
  }: Props = $props()
</script>

<SelectPrimitive.Portal {...portalProps}>
  <SelectPrimitive.Content
    bind:ref
    data-slot="select-content"
    {side}
    {sideOffset}
    {align}
    {preventScroll}
    class={cn(
      'relative z-50 flex max-h-96 min-w-32 flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-sm origin-(--bits-select-content-transform-origin) motion-safe:data-[state=open]:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-100',
      position === 'popper' && 'max-h-[min(24rem,var(--bits-select-content-available-height))]',
      className
    )}
    {...restProps}
  >
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" class="flex shrink-0 items-center justify-center py-1">
      <Icon icon="mdi:chevron-up" class="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport data-slot="select-viewport" class="min-h-0 overflow-y-auto p-1">
      {@render children?.()}
    </SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" class="flex shrink-0 items-center justify-center py-1">
      <Icon icon="mdi:chevron-down" class="size-4" aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content>
</SelectPrimitive.Portal>

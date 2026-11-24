<script lang="ts">
  import { Popover as PopoverPrimitive } from 'bits-ui'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    align = 'center',
    portalProps,
    ...restProps
  }: PopoverPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<PopoverPrimitive.PortalProps>
  } = $props()
</script>

<PopoverPrimitive.Portal {...portalProps}>
  <PopoverPrimitive.Content
    bind:ref
    data-slot="popover-content"
    {sideOffset}
    {align}
    class={cn(
      'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden origin-(--bits-popover-content-transform-origin) motion-safe:data-[state=open]:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-100',
      className
    )}
    {...restProps}
  />
</PopoverPrimitive.Portal>

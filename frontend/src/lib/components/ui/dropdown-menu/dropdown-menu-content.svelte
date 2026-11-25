<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils'

  type Props = DropdownMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<DropdownMenuPrimitive.PortalProps>
  }

  let {
    ref = $bindable(null),
    class: className,
    side = 'bottom',
    align = 'start',
    sideOffset = 4,
    portalProps,
    ...restProps
  }: Props = $props()
</script>

<DropdownMenuPrimitive.Portal {...portalProps}>
  <DropdownMenuPrimitive.Content
    bind:ref
    data-slot="dropdown-menu-content"
    {side}
    {align}
    {sideOffset}
    class={cn(
      'z-50 min-w-40 max-h-(--bits-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-sm origin-(--bits-dropdown-menu-content-transform-origin) motion-safe:data-[state=open]:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-100',
      className
    )}
    {...restProps}
  />
</DropdownMenuPrimitive.Portal>

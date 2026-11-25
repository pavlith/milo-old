<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils'

  type Props = ContextMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ContextMenuPrimitive.PortalProps>
  }

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    ...restProps
  }: Props = $props()
</script>

<ContextMenuPrimitive.Portal {...portalProps}>
  <ContextMenuPrimitive.Content
    bind:ref
    data-slot="context-menu-content"
    class={cn(
      'z-50 min-w-45 max-h-(--bits-context-menu-content-available-height) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-sm origin-(--bits-context-menu-content-transform-origin) motion-safe:data-[state=open]:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-100',
      className
    )}
    {...restProps}
  />
</ContextMenuPrimitive.Portal>

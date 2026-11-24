<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'
  import { cn, type WithoutChild } from '$lib/utils'
  import Icon from '@iconify/svelte'

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & { inset?: boolean } = $props()
</script>

<ContextMenuPrimitive.SubTrigger
  bind:ref
  data-slot="context-menu-sub-trigger"
  data-inset={inset || undefined}
  class={cn(
    'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-inset:pl-8 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-disabled:opacity-50',
    className
  )}
  {...restProps}
>
  {@render children?.()}
  <Icon icon="mdi:chevron-right" class="pointer-events-none ml-auto size-4 shrink-0" aria-hidden="true" />
</ContextMenuPrimitive.SubTrigger>

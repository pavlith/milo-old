<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn, type WithoutChild } from '$lib/utils'
  import Icon from '@iconify/svelte'

  let {
    ref = $bindable(null),
    value,
    label,
    class: className,
    children: itemChildren,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props()
</script>

<SelectPrimitive.Item
  bind:ref
  data-slot="select-item"
  {value}
  {label}
  class={cn(
    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden',
    'data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
    className
  )}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    {#if selected}
      <Icon icon="mdi:check" class="pointer-events-none absolute left-2 size-4" aria-hidden="true" />
    {/if}
    {#if itemChildren}
      {@render itemChildren({ selected, highlighted })}
    {:else}
      {label || value}
    {/if}
  {/snippet}
</SelectPrimitive.Item>

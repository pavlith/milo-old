<script lang="ts">
  import { Checkbox as CheckboxPrimitive } from 'bits-ui'
  import Icon from '@iconify/svelte'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils'

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props()
</script>

<CheckboxPrimitive.Root
  bind:ref
  bind:checked
  bind:indeterminate
  data-slot="checkbox"
  class={cn(
    'peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-muted-foreground bg-background transition-none data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    {#if indeterminate || checked}
      <Icon
        icon={indeterminate ? 'mdi:minus' : 'mdi:check'}
        data-slot="checkbox-indicator"
        class="pointer-events-none size-3.5"
        aria-hidden="true"
      />
    {/if}
  {/snippet}
</CheckboxPrimitive.Root>

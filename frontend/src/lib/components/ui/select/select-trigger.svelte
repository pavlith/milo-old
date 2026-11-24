<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn, type WithoutChild } from '$lib/utils'
  import Icon from '@iconify/svelte'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> = $props()
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot="select-trigger"
  class={cn(
    'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors data-placeholder:text-muted-foreground enabled:hover:border-ring/60 focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...restProps}
>
  {@render children?.()}
  <Icon icon="mdi:chevron-down" class="pointer-events-none size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
</SelectPrimitive.Trigger>

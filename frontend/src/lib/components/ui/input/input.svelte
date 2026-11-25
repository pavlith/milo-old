<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils'
  import type { HTMLInputAttributes } from 'svelte/elements'

  type Props = WithElementRef<Omit<HTMLInputAttributes, 'value'>, HTMLInputElement> & {
    value?: string | number
  }

  let {
    ref = $bindable(null),
    value = $bindable(''),
    class: className,
    ...restProps
  }: Props = $props()
</script>

<input
  bind:this={ref}
  data-slot="input"
  class={cn(
    'flex h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  bind:value
  {...restProps}
/>

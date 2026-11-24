<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils'
  import type { HTMLTextareaAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement>> = $props()
</script>

<textarea
  bind:this={ref}
  bind:value
  data-slot="textarea"
  class={cn(
    'w-full min-w-0 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...restProps}
></textarea>

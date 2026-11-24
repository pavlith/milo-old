<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'

  let { ref = $bindable(null), class: className, children, ...restProps }: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props()
</script>

<div
  bind:this={ref}
  data-slot="dialog-footer"
  class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
  {...restProps}
>
  {@render children?.()}
</div>

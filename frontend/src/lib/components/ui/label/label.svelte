<script lang="ts">
  import { cn } from '$lib/utils'
  import { Label as LabelPrimitive } from 'bits-ui'

  let { ref = $bindable(null), class: className, ...restProps }: LabelPrimitive.RootProps = $props()
</script>

<LabelPrimitive.Root
  bind:ref
  data-slot="label"
  class={cn(
    'text-sm font-medium leading-none select-none group-data-[disabled=true]:opacity-70 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
  {...restProps}
/>

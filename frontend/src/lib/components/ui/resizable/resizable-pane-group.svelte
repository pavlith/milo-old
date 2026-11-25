<script lang="ts">
  import * as ResizablePrimitive from 'paneforge'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ResizablePrimitive.PaneGroupProps = $props()

  let paneGroup: ResizablePrimitive.PaneGroup
  export const getLayout = () => paneGroup?.getLayout()
</script>

<ResizablePrimitive.PaneGroup
  bind:ref
  bind:this={paneGroup}
  data-slot="resizable-pane-group"
  class={cn(
    'flex h-full w-full data-[direction=vertical]:flex-col',
    className
  )}
  {...restProps}
/>

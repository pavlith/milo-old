<script lang="ts">
  import { Switch as SwitchPrimitive } from 'bits-ui'
  import { cn, type WithoutChildrenOrChild } from '$lib/utils'

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SwitchPrimitive.RootProps> = $props()
</script>

<SwitchPrimitive.Root
  bind:ref
  bind:checked
  data-slot="switch"
  class={cn(
    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted-foreground transition-colors data-[state=checked]:bg-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...restProps}
>
  <SwitchPrimitive.Thumb
    data-slot="switch-thumb"
    class="pointer-events-none block size-5 translate-x-1 rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-5"
  />
</SwitchPrimitive.Root>

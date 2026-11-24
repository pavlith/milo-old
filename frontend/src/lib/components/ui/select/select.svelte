<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'

  let {
    value = $bindable(),
    open = $bindable(false),
    ...restProps
  }: Omit<Extract<SelectPrimitive.RootProps, { type: 'single' }>, 'type'> = $props()
</script>

<SelectPrimitive.Root type="single" bind:value bind:open {...restProps} />

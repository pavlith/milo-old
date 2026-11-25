<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { Button } from '$lib/components/ui/button'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { cn } from '$lib/utils'

  let {
    icon,
    label,
    class: className,
    iconClass,
    ...restProps
  }: HTMLButtonAttributes & { icon: string; label: string; iconClass?: string } = $props()
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <Button {...props} {...restProps} aria-label={label} variant="ghost" size="icon-sm" class={className}>
        <Icon {icon} class={cn('size-4', iconClass)} aria-hidden="true" />
      </Button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content sideOffset={5}>{label}</Tooltip.Content>
</Tooltip.Root>

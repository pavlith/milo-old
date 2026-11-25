<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { cn } from '$lib/utils'

  interface Props {
    icon: string
    label: string
    active?: boolean
    disabled?: boolean
    attention?: boolean
    spinning?: boolean
    onclick: () => void
  }

  const { icon, label, active, disabled, attention, spinning, onclick }: Props = $props()
</script>

<Sidebar.MenuItem>
  <Sidebar.MenuButton
    class="relative size-8.5 justify-center p-0 focus-visible:ring-inset"
    isActive={active}
    {disabled}
    aria-label={label}
    aria-pressed={active}
    tooltipContent={label}
    {onclick}
  >
    <Icon {icon} class={cn('size-5!', spinning && 'animate-spin')} />
    {#if attention}
      <span class="absolute right-0.5 top-0.5 size-2 rounded-full bg-destructive ring-1 ring-sidebar"></span>
    {/if}
  </Sidebar.MenuButton>
</Sidebar.MenuItem>

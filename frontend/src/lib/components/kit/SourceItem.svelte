<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'

  interface Props {
    icon?: string
    label: string
    active?: boolean
    onclick?: (e: MouseEvent) => void
  }

  const { icon, label, active = false, onclick }: Props = $props()
</script>

<Sidebar.MenuButton isActive={active} aria-current={active ? 'true' : undefined} {onclick}>
  {#if icon}
    <Icon {icon} aria-hidden="true" />
  {/if}
  <span>{label}</span>
</Sidebar.MenuButton>

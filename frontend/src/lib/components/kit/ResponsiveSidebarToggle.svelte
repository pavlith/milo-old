<script lang="ts">
  import { _ } from '$lib/i18n'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import { getLayoutMode, showSidebar } from '$lib/stores/layout.svelte'

  const { onclick = showSidebar }: { onclick?: () => void } = $props()
</script>

{#if getLayoutMode() === 'narrow'}
  <ToolbarButton icon="mdi:dock-left" label={$_('aria.toggleSidebar')} {onclick} />
{/if}

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { _ } from '$lib/i18n'
  import { cn } from '$lib/utils'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import { getLayoutMode, getResponsiveView, hideSidebar } from '$lib/stores/layout.svelte'

  interface Props {
    title?: string
    label?: string
    body: Snippet
    footer?: Snippet
    containerRef?: HTMLElement | null
    focusable?: boolean
    class?: string
    onkeydown?: (e: KeyboardEvent) => void
    onfocus?: () => void
    onmousedown?: (e: MouseEvent) => void
  }

  let {
    title, label, body, footer, containerRef = $bindable(null), focusable = false,
    class: extraClass, onkeydown, onfocus, onmousedown,
  }: Props = $props()

  const narrow = $derived(getLayoutMode() === 'narrow')
  const overlayVisible = $derived(narrow && getResponsiveView() === 'sidebar')
</script>

<Sidebar.Root
  bind:ref={containerRef}
  role="navigation"
  aria-label={label ?? title ?? $_('aria.toggleSidebar')}
  tabindex={focusable ? 0 : undefined}
  inert={narrow && !overlayVisible}
  class={cn('w-60 shrink-0 outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring',
    narrow && 'responsive-sidebar-overlay w-72', overlayVisible && 'responsive-sidebar-visible', extraClass)}
  {onkeydown}
  {onfocus}
  {onmousedown}
>
  {#if narrow || title}
    <Sidebar.Header class="min-h-[52px] flex-row items-center gap-2 px-3">
      {#if narrow}
        <ToolbarButton icon="mdi:arrow-left" label={$_('common.back')} onclick={hideSidebar} />
      {/if}
      {#if title}
        <h2 class="truncate text-base font-semibold leading-tight">{title}</h2>
      {/if}
    </Sidebar.Header>
  {/if}

  <Sidebar.Content class="overflow-hidden">
    <ScrollArea class="min-h-0 flex-1">
      {@render body()}
    </ScrollArea>
  </Sidebar.Content>

  {@render footer?.()}
</Sidebar.Root>

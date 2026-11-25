<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils'
  import { _ } from '$lib/i18n'
  import * as Resizable from '$lib/components/ui/resizable'
  import { getLayoutMode, getResponsiveView, hideSidebar } from '$lib/stores/layout.svelte'
  import { getUIState, getUIStateVersion, paneConstraints, saveUIState } from '$lib/stores/uiState.svelte'

  const { sidebar, list, viewer }: { sidebar: Snippet; list: Snippet; viewer: Snippet } = $props()

  const HANDLE_WIDTH = 1
  const VIEWER_MIN = 160
  let width = $state(0)
  let group: Resizable.PaneGroup | null = null

  const full = $derived(getLayoutMode() === 'full')
  const narrow = $derived(getLayoutMode() === 'narrow')
  const sidebarVisible = $derived(getResponsiveView() === 'sidebar')
  const paneWidth = $derived(full ? Math.max(0, width - 2 * HANDLE_WIDTH) : 0)
  const sizes = $derived.by(() => {
    if (!paneWidth) return
    getUIStateVersion()
    const { sidebarWidth, listWidth } = getUIState()
    return {
      sidebar: percent(sidebarWidth),
      list: percent(Math.min(listWidth, paneWidth - sidebarWidth - VIEWER_MIN)),
    }
  })

  function percent(pixels: number): number {
    return 100 * pixels / paneWidth
  }

  function persistWidths() {
    const layout = group?.getLayout()
    if (!paneWidth || layout?.length !== 3) return

    const sidebarWidth = Math.round(layout[0] * paneWidth / 100)
    const listWidth = Math.round(layout[1] * paneWidth / 100)
    const saved = getUIState()
    if (sidebarWidth === saved.sidebarWidth && listWidth === saved.listWidth) return
    saveUIState({ sidebarWidth, listWidth })
  }

  function handleDragging(dragging: boolean) {
    if (!dragging) persistWidths()
  }

  function handleResizeKey(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      // PaneForge handles the key on the same element before we read the layout.
      queueMicrotask(persistWidths)
    }
  }
</script>

<div class="h-full min-w-0 flex-1" bind:clientWidth={width}>
  <Resizable.PaneGroup
    bind:this={group}
    direction="horizontal"
    class="relative"
    keyboardResizeBy={paneWidth ? percent(10) : undefined}
  >
    <Resizable.Pane
      class={narrow
        ? cn('responsive-sidebar-overlay w-72', sidebarVisible && 'responsive-sidebar-visible')
        : full ? 'min-w-0' : 'w-60 flex-none!'}
      inert={narrow && !sidebarVisible}
      defaultSize={sizes?.sidebar}
      minSize={paneWidth ? percent(paneConstraints.sidebar.min) : undefined}
      maxSize={paneWidth ? percent(paneConstraints.sidebar.max) : undefined}
    >
      {@render sidebar()}
    </Resizable.Pane>

    {#if full}
      <Resizable.Handle
        aria-label={$_('aria.resizeSidebar')}
        onDraggingChange={handleDragging}
        onkeydown={handleResizeKey}
      />
    {/if}

    <Resizable.Pane
      class={full ? 'min-w-0' : 'min-w-0 flex-1!'}
      defaultSize={sizes?.list}
      minSize={paneWidth ? percent(paneConstraints.list.min) : undefined}
      maxSize={paneWidth ? percent(paneConstraints.list.max) : undefined}
    >
      {@render list()}
    </Resizable.Pane>

    {#if full}
      <Resizable.Handle
        aria-label={$_('aria.resizeMessageList')}
        onDraggingChange={handleDragging}
        onkeydown={handleResizeKey}
      />
    {/if}

    <Resizable.Pane class={full ? 'min-w-0 overflow-visible!' : 'w-0 flex-none! overflow-visible!'}
      minSize={paneWidth ? percent(VIEWER_MIN) : undefined}
    >
      {@render viewer()}
    </Resizable.Pane>

    {#if narrow}
      <button
        type="button"
        class="responsive-scrim"
        class:responsive-scrim-visible={sidebarVisible}
        tabindex="-1"
        aria-hidden={!sidebarVisible}
        onclick={hideSidebar}
        aria-label={$_('aria.closeSidebar')}
      ></button>
    {/if}
  </Resizable.PaneGroup>
</div>

<script lang="ts" generics="T extends { id: string }">
  // SourceSidebar — sectioned left sidebar primitive for extensions.
  // Owns keyboard navigation (Up/Down/J/K within sidebar) via tabindex+focus.
  // Selection state managed by consumer via selectedId + onSelect.
  //
  // Pane-focus store integration mirrors ListPane: registers focusSlot, takes
  // DOM focus when the slot matches so Alt+H/L cycling routes here.
  //
  // Visual chrome (container styling + responsive overlay + back button +
  // title) is delegated to kit `SidebarFrame`. Future cross-extension settings
  // (sidebar density, font-size) wire into SidebarFrame; SourceSidebar
  // consumers inherit them automatically.

  import { type Snippet, onMount } from 'svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import SidebarFrame from './SidebarFrame.svelte'
  import { KEY } from '$lib/keyboard/shortcuts'
  import { setFocusedPane, getFocusedPane, isPaneFlashing, registerPaneNav, type FocusablePane } from '$lib/stores/keyboard.svelte'

  type SourceSection<U extends { id: string }> = {
    heading?: string
    items: U[]
  }

  interface Props {
    title?: string
    sections: SourceSection<T>[]
    selectedId: string | null
    focusSlot?: FocusablePane
    label?: string
    item: Snippet<[T, { active: boolean }]>
    header?: Snippet
    sectionEmpty?: Snippet<[SourceSection<T>]>
    /** Optional sticky bottom strip — forwarded to SidebarFrame's footer
     *  slot. Consumers typically render kit `SidebarFooter` here for the
     *  shared sync/settings chrome. */
    footerContent?: Snippet
    onSelect: (id: string) => void
  }

  const {
    title,
    sections,
    selectedId,
    focusSlot = 'sidebar',
    label,
    item,
    header,
    sectionEmpty,
    footerContent,
    onSelect,
  }: Props = $props()

  let containerRef = $state<HTMLElement | null>(null)

  const allItems = $derived(sections.flatMap(s => s.items))

  $effect(() => {
    if (getFocusedPane() === focusSlot && containerRef && document.activeElement !== containerRef) {
      containerRef.focus()
    }
  })

  function indexOf(id: string | null): number {
    if (id == null) return -1
    return allItems.findIndex(it => it.id === id)
  }

  function move(step: number) {
    if (allItems.length === 0) return
    const idx = indexOf(selectedId)
    const next = idx < 0
      ? (step > 0 ? 0 : allItems.length - 1)
      : Math.max(0, Math.min(allItems.length - 1, idx + step))
    onSelect(allItems[next].id)
  }

  // Jump to first / last item (Alt+G / Alt+Shift+G via paneNav)
  function jumpTo(index: number) {
    if (allItems.length === 0) return
    onSelect(allItems[index].id)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.target !== containerRef && !(e.target instanceof Element && e.target.matches('[data-sidebar="menu-button"]'))) return
    if (KEY.LIST_NEXT(e)) {
      e.preventDefault()
      e.stopPropagation()
      move(1)
      return
    }
    if (KEY.LIST_PREV(e)) {
      e.preventDefault()
      e.stopPropagation()
      move(-1)
      return
    }
    if (e.target === containerRef && KEY.LIST_OPEN(e)) {
      if (selectedId == null) return
      e.preventDefault()
      e.stopPropagation()
      onSelect(selectedId)
      return
    }
  }

  function handleFocus() {
    if (getFocusedPane() !== focusSlot) {
      setFocusedPane(focusSlot)
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.target instanceof Element && e.target.closest('button, input, a')) return
    if (containerRef && document.activeElement !== containerRef) {
      containerRef.focus()
    }
  }

  // Register so Alt+J/K dispatched from the global handler routes here.
  onMount(() => registerPaneNav(focusSlot, {
    navigateNext: () => move(1),
    navigatePrev: () => move(-1),
    navigateFirst: () => jumpTo(0),
    navigateLast: () => jumpTo(allItems.length - 1),
    activate: () => { if (selectedId != null) onSelect(selectedId) },
  }))

  const flashing = $derived(isPaneFlashing(focusSlot))
</script>

<SidebarFrame
  {title}
  {label}
  bind:containerRef
  focusable
  class={flashing ? 'pane-focus-flash' : ''}
  onkeydown={handleKeyDown}
  onfocus={handleFocus}
  onmousedown={handleMouseDown}
>
  {#snippet body()}
    {#if header}
      {@render header()}
    {/if}

    {#each sections as section, sIdx (sIdx)}
      <Sidebar.Group>
        {#if section.heading}
          <h3 class="truncate px-2 py-1 text-xs font-medium text-muted-foreground">{section.heading}</h3>
        {/if}
        <Sidebar.GroupContent>
          {#if section.items.length === 0}
            {@render sectionEmpty?.(section)}
          {:else}
            <Sidebar.Menu>
              {#each section.items as it (it.id)}
                <Sidebar.MenuItem>
                  {@render item(it, { active: it.id === selectedId })}
                </Sidebar.MenuItem>
              {/each}
            </Sidebar.Menu>
          {/if}
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}
  {/snippet}

  {#snippet footer()}
    {#if footerContent}
      {@render footerContent()}
    {/if}
  {/snippet}
</SidebarFrame>

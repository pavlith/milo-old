<script lang="ts">
  import { createVirtualizer, defaultRangeExtractor } from '@tanstack/svelte-virtual'
  import { untrack, type Snippet } from 'svelte'

  const {
    viewport, keys, selectedIndex, estimatedHeight, header, row,
  }: {
    viewport: HTMLElement | null
    keys: string[]
    selectedIndex: number
    estimatedHeight: number
    header?: Snippet
    row: Snippet<[index: number]>
  } = $props()

  let headerHeight = $state(0)
  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => null,
    estimateSize: () => 80,
  })

  $effect(() => {
    const element = viewport as HTMLDivElement | null
    const itemKeys = keys
    const pinned = selectedIndex
    const height = estimatedHeight
    const margin = headerHeight
    untrack(() => {
      $virtualizer.setOptions({
        count: itemKeys.length,
        getScrollElement: () => element,
        getItemKey: (index) => itemKeys[index],
        estimateSize: () => height,
        scrollMargin: margin,
        overscan: 6,
        paddingStart: 8,
        paddingEnd: 8,
        gap: 6,
        rangeExtractor: (range) => {
          const indices = defaultRangeExtractor(range)
          // Keep the selected row's context menu and keyboard actions mounted.
          if (pinned >= 0 && !indices.includes(pinned)) {
            indices.push(pinned)
            indices.sort((a, b) => a - b)
          }
          return indices
        },
      })
    })
  })

  export function scrollToIndex(index: number) {
    $virtualizer.scrollToIndex(index, { align: 'auto' })
  }

  function measure(node: HTMLDivElement) {
    untrack(() => $virtualizer.measureElement(node))
    return () => $virtualizer.measureElement(null)
  }
</script>

{#if header}
  <div bind:clientHeight={headerHeight}>
    {@render header()}
  </div>
{/if}
<div class="relative" style:height="{$virtualizer.getTotalSize()}px">
  {#each $virtualizer.getVirtualItems() as item (item.key)}
    <div
      data-index={item.index}
      class="absolute inset-x-2 top-0"
      style:transform="translateY({item.start - headerHeight}px)"
      {@attach measure}
    >
      {@render row(item.index)}
    </div>
  {/each}
</div>

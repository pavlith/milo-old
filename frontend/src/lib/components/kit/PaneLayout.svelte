<script lang="ts">
  import type { Snippet } from 'svelte'
  import { _ } from '$lib/i18n'
  import { cn } from '$lib/utils'
  import * as Resizable from '$lib/components/ui/resizable'
  import { getLayoutMode, getResponsiveView, hideSidebar } from '$lib/stores/layout.svelte'

  interface Props {
    children?: Snippet
    sidebar?: Snippet
    content?: Snippet
    detail?: Snippet
    detailResizeLabel?: string
  }

  const { children, sidebar, content, detail, detailResizeLabel }: Props = $props()
  const full = $derived(getLayoutMode() === 'full')
  const narrow = $derived(getLayoutMode() === 'narrow')
  const sidebarVisible = $derived(getResponsiveView() === 'sidebar')
</script>

<div class="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
  {#if sidebar && content}
    <Resizable.PaneGroup direction="horizontal" class="relative">
      <Resizable.Pane
        class={cn(narrow
          ? 'w-0 flex-none! overflow-visible!'
          : full ? 'min-w-0 [&>[data-sidebar=sidebar]]:w-full' : 'w-60 flex-none!')}
        defaultSize={detail ? 21 : 24}
        minSize={15}
        maxSize={35}
      >
        {@render sidebar()}
      </Resizable.Pane>
      {#if full}
        <Resizable.Handle aria-label={$_('aria.resizeSidebar')} />
      {/if}
      <Resizable.Pane class={cn('min-w-0', !full && 'flex-1!')} defaultSize={detail ? 33 : 76} minSize={22}>
        {@render content()}
      </Resizable.Pane>
      {#if detail}
        {#if full}
          <Resizable.Handle aria-label={detailResizeLabel} />
        {/if}
        <Resizable.Pane
          class={cn('min-w-0 overflow-visible!', !full && 'w-0 flex-none!')}
          defaultSize={46}
          minSize={25}
        >
          {@render detail()}
        </Resizable.Pane>
      {/if}
    </Resizable.PaneGroup>
  {:else}
    {@render children?.()}
  {/if}

  {#if narrow}
    <button
      type="button"
      class="responsive-scrim"
      class:responsive-scrim-visible={sidebarVisible}
      tabindex="-1"
      aria-hidden={!sidebarVisible}
      aria-label={$_('aria.closeSidebar')}
      onclick={hideSidebar}
    ></button>
  {/if}
</div>

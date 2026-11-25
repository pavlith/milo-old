<script lang="ts">
  // DetailPane — generic right-pane shell: optional header slot, scrollable
  // body slot, and an empty-state slot rendered when `empty` is true. No
  // keyboard ownership (read-only viewing area; keys pass through to global
  // handler).

  import { type Snippet } from 'svelte'
  import { cn } from '$lib/utils'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import * as Empty from '$lib/components/ui/empty'
  import Icon from '@iconify/svelte'
  import { _ } from 'svelte-i18n'
  import { isPaneFlashing, type FocusablePane } from '$lib/stores/keyboard.svelte'
  // Self-managed responsive (mobile + tablet) behavior — read the layout
  // store directly so consumers (extension panes) never forward responsive
  // props. At medium (≤1024px) and narrow (≤767px) the detail pane renders
  // as an overlay AND a back-arrow button is injected at the start of the
  // header (calls hideViewer to return to the list). Matches mail's
  // ConversationViewer pattern at App.svelte:1488 1-for-1.
  import { isResponsive, getResponsiveView, hideViewer } from '$lib/stores/layout.svelte'

  interface Props {
    /** True when there's nothing to show. Empty snippet renders when true. */
    empty?: boolean
    /** Which pane-focus slot this detail pane occupies (default 'viewer'). */
    focusSlot?: FocusablePane
    /** Header snippet (typically: title + action buttons). */
    header?: Snippet
    /** Body snippet (typically scrollable content). */
    body?: Snippet
    /** Empty-state snippet. If absent, a default placeholder renders. */
    emptyState?: Snippet
    /** Iconify identifier used in the default empty-state placeholder. */
    emptyIcon?: string
    /** Text used in the default empty-state placeholder. */
    emptyText?: string
  }

  const {
    empty = false,
    focusSlot = 'viewer',
    header,
    body,
    emptyState,
    emptyIcon = 'mdi:tray-arrow-down',
    emptyText,
  }: Props = $props()

  const flashing = $derived(isPaneFlashing(focusSlot))
  const overlay = $derived(isResponsive())
  const visible = $derived(getResponsiveView() === 'viewer')
</script>

<section
  class={cn('flex h-full min-w-0 flex-1 flex-col bg-background', flashing && 'pane-focus-flash',
    overlay && 'responsive-viewer-overlay', overlay && visible && 'responsive-viewer-visible')}
  inert={overlay && !visible}
>
  {#if overlay || (!empty && header)}
    <header class="flex min-h-[52px] shrink-0 items-center gap-2 border-b px-3 py-2">
      {#if overlay}
        <ToolbarButton icon="mdi:arrow-left" label={$_('common.back')} onclick={hideViewer} />
      {/if}
      {#if !empty && header}
        {@render header()}
      {/if}
    </header>
  {/if}

  {#if empty}
    {#if emptyState}
      <div class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        {@render emptyState()}
      </div>
    {:else}
      <Empty.Root>
        <Empty.Header>
          <Empty.Media variant="icon"><Icon icon={emptyIcon} aria-hidden="true" /></Empty.Media>
          <Empty.Description>{emptyText ?? $_('common.nothingSelected')}</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/if}
  {:else}
    <div class="flex-1 min-h-0 overflow-y-auto p-6">
      {#if body}
        {@render body()}
      {/if}
    </div>
  {/if}
</section>

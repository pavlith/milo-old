<script lang="ts">
  import { formatTimeSince } from '$lib/utils/date'
  // CalendarSidebar — left sidebar listing sources + their calendars.
  // Issue #118 pattern: one section per source, per-calendar rows with
  // checkbox + color swatch + truncated name. Bottom strip (anchored via
  // SidebarFrame's footer slot): last-sync indicator + settings cog.
  //
  // NOT built on kit SourceSidebar because calendar's semantics are
  // multi-toggle visibility, not single-source-select. Built on the
  // lower-level kit `SidebarFrame` which owns container chrome + responsive
  // overlay + title + body/footer slots; visual parity with contacts'
  // sidebar (and any future extension sidebar) is automatic.

  import { _, locale } from 'svelte-i18n'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Label } from '$lib/components/ui/label'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import SidebarFrame from '$lib/components/kit/SidebarFrame.svelte'
  import SidebarFooter from '$lib/components/kit/SidebarFooter.svelte'
  import SidebarSyncStatus from '$lib/components/kit/SidebarSyncStatus.svelte'
  import AddCalendarMenu from './AddCalendarMenu.svelte'
  import { calendarSources } from '$extensions/calendar/frontend/stores/calendarSources.svelte'
  import { onMount, onDestroy } from 'svelte'
  import type { backend } from '$lib/models'

  interface Props {
    onOpenSettings?: () => void
  }

  let { onOpenSettings }: Props = $props()

  // Sections derived from the sources store. Empty when no sources are
  // configured yet — the bottom-strip "Add CalDAV" button is the entry point.
  const sections = $derived.by(() => {
    const out: { source: backend.Source; calendars: backend.Calendar[] }[] = []
    for (const src of calendarSources.sources) {
      const cals = calendarSources.calendarsBySource[src.id] || []
      out.push({ source: src, calendars: cals })
    }
    return out
  })

  // Reactive `now` so the elapsed-time label refreshes every 60s without
  // needing a sync event. Direct Date.now() inside the $derived would be
  // captured at first read and stay frozen until another reactive dep
  // changes.
  let now = $state(Date.now())
  let nowTickId: ReturnType<typeof setInterval> | null = null
  onMount(() => {
    nowTickId = setInterval(() => { now = Date.now() }, 60_000)
  })
  onDestroy(() => {
    if (nowTickId !== null) clearInterval(nowTickId)
  })

  // Friendly last-sync label for the bottom strip. Picks the most-recent
  // last_synced_at across sources; "never" if none have synced yet.
  const lastSyncedLabel = $derived.by(() => {
    let latest = 0
    for (const s of calendarSources.sources) {
      if (s.lastSyncedAt > latest) latest = s.lastSyncedAt
    }
    if (latest === 0) return $_('calendar.sidebar.lastSyncNever')
    const time = formatTimeSince(latest * 1000, $locale)
    return $_('calendar.sidebar.lastSync', { values: { time } })
  })

  // Phase-aware label when a sync is in flight. Started → "Syncing Murena…";
  // progress → "Syncing Murena · Personal (2/4)". Falls back to a bare
  // "Syncing…" when the source name isn't yet known (sync-started raced
  // ahead of the source-name lookup, extremely rare).
  const syncingLabel = $derived.by(() => {
    const s = calendarSources.currentSyncState
    if (!s) return ''
    if (s.phase === 'progress' && s.calendarName && s.totalCalendars) {
      return $_('calendar.sidebar.syncingCalendar', { values: {
        source: s.sourceName,
        name: s.calendarName,
        n: s.currentCalendar ?? 0,
        total: s.totalCalendars,
      }})
    }
    if (s.sourceName) {
      return $_('calendar.sidebar.syncing', { values: { name: s.sourceName } })
    }
    return $_('calendar.sidebar.syncingGeneric')
  })

  const currentError = $derived(calendarSources.currentErrorState?.errorMessage ?? '')

  function toggleVisibility(cal: backend.Calendar) {
    void calendarSources.setVisible(cal.id, !cal.visible)
  }
</script>

<SidebarFrame title={$_('calendar.sidebar.title')}>
  {#snippet body()}
    {#if sections.length === 0}
      <p class="px-4 py-3 text-xs text-muted-foreground">{$_('calendar.sidebar.noCalendars')}</p>
    {/if}

    {#each sections as section (section.source.id)}
      <Sidebar.Group>
        <h3 class="truncate px-2 py-1 text-xs font-medium text-muted-foreground">{section.source.name}</h3>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each section.calendars as cal (cal.id)}
              <Sidebar.MenuItem class="flex h-8 items-center gap-2 rounded-md px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Checkbox
                  id={'calendar-visible-' + cal.id}
                  checked={cal.visible}
                  onCheckedChange={() => toggleVisibility(cal)}
                  onkeydown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      toggleVisibility(cal)
                    }
                  }}
                />
                <Label for={'calendar-visible-' + cal.id} class="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 font-normal">
                  <span class="size-2.5 shrink-0 rounded-full" style:background-color={calendarSources.colorOf(cal.id)} aria-hidden="true"></span>
                  <span class="truncate">{cal.displayName}</span>
                </Label>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}

    <AddCalendarMenu />
  {/snippet}

  {#snippet footer()}
    <SidebarFooter>
      {#snippet leading()}
        <SidebarSyncStatus
          syncing={calendarSources.isAnySyncing}
          idleLabel={lastSyncedLabel}
          syncingLabel={syncingLabel}
          errorLabel={currentError !== '' ? $_('calendar.sidebar.syncError') : undefined}
          errorDetail={currentError || undefined}
          onSync={() => calendarSources.syncAll()}
        />
      {/snippet}
      {#snippet trailing()}
        <ToolbarButton
          icon="mdi:cog-outline"
          label={$_('calendar.sidebar.settings')}
          onclick={() => onOpenSettings?.()}
        />
      {/snippet}
    </SidebarFooter>
  {/snippet}
</SidebarFrame>

<script lang="ts">
  // ViewSwitcher — top toolbar of the calendar pane. Houses the view
  // selector (Month/Week/Day/Agenda), date navigation (<, Today, >),
  // tz indicator, and the Sync button.
  //
  // All four view kinds are wired as of 1F.

  import { _, locale } from 'svelte-i18n'
  import Icon from '@iconify/svelte'
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import { Button } from '$lib/components/ui/button'
  import ResponsiveSidebarToggle from '$lib/components/kit/ResponsiveSidebarToggle.svelte'
  import TimezonePicker from './TimezonePicker.svelte'
  import MiniCalendar from './MiniCalendar.svelte'
  import { calendarView, type ViewKind } from '$extensions/calendar/frontend/stores/calendarView.svelte'
  import { calendarSources } from '$extensions/calendar/frontend/stores/calendarSources.svelte'
  import { calendarSettings } from '$extensions/calendar/frontend/stores/calendarSettings.svelte'

  interface ViewOption {
    kind: ViewKind
    label: string
  }

  const viewOptions = $derived<ViewOption[]>([
    { kind: 'month', label: $_('calendar.viewSwitcher.month') },
    { kind: 'week', label: $_('calendar.viewSwitcher.week') },
    { kind: 'day', label: $_('calendar.viewSwitcher.day') },
    { kind: 'agenda', label: $_('calendar.viewSwitcher.agenda') },
  ])

  // Human-readable title for the current anchor + view, formatted in the
  // user's chosen display timezone (calendarSettings.effectiveTimezone).
  const title = $derived.by(() => {
    const tz = calendarSettings.effectiveTimezone
    const d = calendarView.anchorDate
    const opts: Intl.DateTimeFormatOptions = calendarView.viewKind === 'month'
      ? { month: 'long', year: 'numeric', timeZone: tz }
      : { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz }
    return new Intl.DateTimeFormat($locale || undefined, opts).format(d)
  })

  let syncing = $state(false)
  // Animate whenever this button's own RPC is awaiting OR a background
  // sync (ticker / wake / network-online) is in progress. The local
  // `syncing` flag still gates button-disable so users can't double-click
  // — we only spread the spinner trigger.
  const animateSpin = $derived(syncing || calendarSources.isAnySyncing)

  // "+ Event" button is visible when at least one writable calendar exists.
  // Local + CalDAV (post-Chunk 2) both qualify; Google + Microsoft join in
  // Chunks 3-4 with the same flag derived from the provider's accessRole /
  // canEdit at sync time.
  const hasWritableCalendar = $derived.by(() => {
    for (const src of calendarSources.sources) {
      if (src.writable && (calendarSources.calendarsBySource[src.id] || []).length > 0) {
        return true
      }
    }
    return false
  })

  async function handleSync() {
    if (syncing) return
    syncing = true
    try {
      await calendarSources.syncAll()
    } finally {
      syncing = false
    }
  }

</script>

<header class="flex min-h-[52px] shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b bg-background px-3 py-2">
  <div class="flex min-w-0 flex-wrap items-center gap-1">
    <ResponsiveSidebarToggle />
    <ToggleGroup.Root
      type="single"
      bind:value={() => calendarView.viewKind, (value) => {
        const option = viewOptions.find((option) => option.kind === value)
        if (option) calendarView.setViewKind(option.kind)
      }}
      aria-label={$_('calendar.viewSwitcher.view')}
    >
      {#each viewOptions as opt (opt.kind)}
        <ToggleGroup.Item value={opt.kind}>{opt.label}</ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>

    <div class="inline-flex items-center gap-0.5">
      <ToolbarButton icon="mdi:chevron-left" label={$_('calendar.viewSwitcher.prev')} onclick={() => calendarView.goPrev()} />
      <Button size="sm" variant="outline" class="h-8" onclick={() => calendarView.goToday()}>
        {$_('calendar.viewSwitcher.today')}
      </Button>
      <ToolbarButton icon="mdi:chevron-right" label={$_('calendar.viewSwitcher.next')} onclick={() => calendarView.goNext()} />
    </div>

    <MiniCalendar {title} />
  </div>

  <!-- Right: tz picker + new event + sync. -->
  <div class="flex shrink-0 items-center gap-1">
    <div class="hidden sm:inline">
      <TimezonePicker />
    </div>
    {#if hasWritableCalendar}
      <Button
        size="sm"
        variant="outline"
        class="h-8 gap-1.5"
        onclick={() => calendarView.requestNewEvent()}
      >
        <Icon icon="mdi:plus" class="size-4" />
        {$_('calendar.viewSwitcher.newEvent')}
      </Button>
    {/if}
    <Button
      size="sm"
      variant="outline"
      class="h-8 gap-1.5"
      onclick={handleSync}
      disabled={syncing}
    >
      {#if animateSpin}
        <Icon icon="mdi:loading" class="size-4 animate-spin" />
      {:else}
        <Icon icon="mdi:sync" class="size-4" />
      {/if}
      {$_('calendar.viewSwitcher.sync')}
    </Button>
  </div>
</header>

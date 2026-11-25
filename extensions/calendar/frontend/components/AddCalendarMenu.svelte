<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Icon from '@iconify/svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { calendarSources } from '$extensions/calendar/frontend/stores/calendarSources.svelte'
  import AddLocalCalendarDialog from './AddLocalCalendarDialog.svelte'
  import AddCalDAVSourceDialog from './AddCalDAVSourceDialog.svelte'
  import AddGoogleCalendarDialog from './AddGoogleCalendarDialog.svelte'
  import AddMicrosoftCalendarDialog from './AddMicrosoftCalendarDialog.svelte'

  let showAddLocal = $state(false)
  let showAddCalDAV = $state(false)
  let showAddGoogle = $state(false)
  let showAddMicrosoft = $state(false)
</script>

<Sidebar.Group>
  <Sidebar.Menu>
    <Sidebar.MenuItem>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton {...props}>
              <Icon icon="mdi:plus" aria-hidden="true" />
              <span class="flex-1">{$_('calendar.addCalendar.trigger')}</span>
              <Icon icon="mdi:chevron-down" aria-hidden="true" />
            </Sidebar.MenuButton>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" class="min-w-44">
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => showAddLocal = true}>
              <Icon icon="mdi:laptop" class="mr-2 size-4" aria-hidden="true" />
              {$_('calendar.addCalendar.local')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => showAddCalDAV = true}>
              <Icon icon="mdi:server-network" class="mr-2 size-4" aria-hidden="true" />
              {$_('calendar.addCalendar.caldav')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => showAddGoogle = true}>
              <Icon icon="logos:google-icon" class="mr-2 size-4" aria-hidden="true" />
              {$_('calendar.addCalendar.google')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => showAddMicrosoft = true}>
              <Icon icon="logos:microsoft-icon" class="mr-2 size-4" aria-hidden="true" />
              {$_('calendar.addCalendar.microsoft')}
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
</Sidebar.Group>

<AddLocalCalendarDialog
  bind:open={showAddLocal}
  onCreated={() => { void calendarSources.load() }}
/>

<AddCalDAVSourceDialog
  bind:open={showAddCalDAV}
  onClose={() => { void calendarSources.load() }}
/>

<AddGoogleCalendarDialog
  bind:open={showAddGoogle}
  onClose={() => { void calendarSources.load() }}
/>

<AddMicrosoftCalendarDialog
  bind:open={showAddMicrosoft}
  onClose={() => { void calendarSources.load() }}
/>

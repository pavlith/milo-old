<script lang="ts">
  // ContactList — mirrors mail's MessageList toolbar pattern:
  //
  //   [Title  |  Search input (when open)]      [Search]  [Sort]
  //
  // Search bar is HIDDEN by default and toggled open via the search button
  // or Ctrl+S. toggleSearchFocus() is exposed to ListPane's onFocusSearch
  // so the global Ctrl+S handler cycles through the same three states mail
  // uses: closed → focused → closed.
  //
  // Sort is local component state (A-Z / Z-A). Lists are small enough that
  // sorting client-side via $derived is cheaper than a backend round-trip.
  // Filter UI is intentionally omitted — comes when contacts gains tags or
  // groups in a later phase.

  import { onDestroy, tick } from 'svelte'
  import { useDebounce } from 'runed'
  import Icon from '@iconify/svelte'
  import { _ } from 'svelte-i18n'
  import ListPane from '$lib/components/kit/ListPane.svelte'
  import ListRow from '$lib/components/kit/ListRow.svelte'
  import Avatar from '$lib/components/kit/Avatar.svelte'
  import ConfirmDialog from '$lib/components/kit/ConfirmDialog.svelte'
  import { contactsView, reloadContacts, loadMoreContacts, focusContact, activateContact, setSearchQuery, deleteLocalContact } from '$extensions/contacts/frontend/stores/contactsView.svelte'
  import { contactSourcesStore } from '$extensions/contacts/frontend/stores/contactSources.svelte'
  import { toasts } from '$lib/stores/toast'
  import WriteAccessBanner from './WriteAccessBanner.svelte'
  // Canonical list toolbar — owns hamburger placement, title styling, count
  // badge, search-mode swap. Extension just supplies label/count + per-extension
  // search markup + trailing action buttons.
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import * as Empty from '$lib/components/ui/empty'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import ListHeader from '$lib/components/kit/ListHeader.svelte'
  import type { v1 } from '$lib/models'

  interface Props {
    onAdd?: () => void
  }

  let { onAdd }: Props = $props()

  type SortOrder = 'name-asc' | 'name-desc'

  let showSearch = $state(false)
  let searchInput = $state('')
  // Plain `let` (not $state) — same as App.svelte's component refs. The
  // ref is only read inside event handlers (focus / blur / select / equality
  // check against document.activeElement), never in a reactive context, so
  // making it $state adds overhead without benefit.
  // svelte-ignore non_reactive_update
  let searchInputEl: HTMLInputElement | null = null
  let sortOrder = $state<SortOrder>('name-asc')

  // Delete-confirmation state for keyboard-triggered deletes. ContactDetail
  // has its own button-triggered confirm dialog; this one fires when the user
  // has the LIST focused and hits Delete/Backspace on the highlighted row.
  // Mirrors ContactDetail's writability gate: local always writable; CardDAV
  // gated on the source's writable flag.
  let showDeleteConfirm = $state(false)
  let pendingDelete = $state<v1.Contact | null>(null)
  let deleting = $state(false)

  function requestDelete(id: string) {
    const found = contactsView.contacts.find(c => c.id === id)
    if (!found) return
    const writable =
      found.sourceId === 'aerion' || contactSourcesStore.isSourceWritable(found.sourceId)
    if (!writable) return
    pendingDelete = found
    showDeleteConfirm = true
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    deleting = true
    try {
      await deleteLocalContact(pendingDelete!.id)
      toasts.success($_('contacts.toast.deleted'))
    } catch (err) {
      console.error('Failed to delete contact:', err)
      toasts.error($_('contacts.toast.failedDelete'))
    } finally {
      deleting = false
      pendingDelete = null
    }
  }

  const scheduleSearch = useDebounce(() => {
    setSearchQuery(searchInput)
    reloadContacts()
  }, 200)

  function cancelSearch() {
    if (scheduleSearch.pending) scheduleSearch.cancel()
  }

  onDestroy(() => {
    // Let Runed recheck its queue after teardown when input and navigation share an update.
    void scheduleSearch.cancel()
  })

  function onSearchInput(event: Event) {
    searchInput = (event.currentTarget as HTMLInputElement).value
    void scheduleSearch().catch((error) => {
      if (error !== 'Cancelled') console.error('Failed to schedule contacts search:', error)
    })
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      // Match mail: Enter blurs the input and hands focus to the list so j/k
      // navigation works immediately on filtered results.
      e.preventDefault()
      searchInputEl?.blur()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      clearSearch()
    }
  }

  function clearSearch() {
    searchInput = ''
    setSearchQuery('')
    showSearch = false
    cancelSearch()
    reloadContacts()
  }

  // Three-state Ctrl+S toggle (matches MessageList.toggleSearchFocus):
  //   closed                  → open + focus
  //   open but unfocused      → focus
  //   open and focused        → close
  function toggleSearchFocus() {
    if (!showSearch) {
      showSearch = true
      void tick().then(() => {
        searchInputEl?.focus()
        searchInputEl?.select()
      })
      return
    }
    if (document.activeElement !== searchInputEl) {
      searchInputEl?.focus()
      searchInputEl?.select()
      return
    }
    clearSearch()
  }

  function toggleSort() {
    sortOrder = sortOrder === 'name-asc' ? 'name-desc' : 'name-asc'
  }

  function primaryEmail(c: v1.Contact): string {
    return c.emails && c.emails.length > 0 ? c.emails[0] : ''
  }

  function rowKey(c: v1.Contact): string {
    return (c.name || primaryEmail(c) || '').toLowerCase()
  }

  // Client-side sort of the already-loaded list. Backend handles query
  // filtering; sort is purely a view concern.
  const sortedContacts = $derived.by(() => {
    const items = [...contactsView.contacts]
    const dir = sortOrder === 'name-asc' ? 1 : -1
    items.sort((a, b) => {
      const ka = rowKey(a)
      const kb = rowKey(b)
      if (ka < kb) return -1 * dir
      if (ka > kb) return 1 * dir
      return 0
    })
    return items
  })

  // Header label tracks the sidebar's selected category — mirrors mail's
  // MessageList showing the active folder name. Local sub-sources reuse the
  // sidebar i18n keys (so labels stay consistent). CardDAV sources resolve
  // to the user-given source name; unknown ids fall back to the generic
  // "Contacts" label so the header is never empty.
  const headerLabel = $derived.by(() => {
    const sel = contactsView.selectedSourceId
    if (sel === '') return $_('contacts.sidebar.all')
    if (sel === 'local') return $_('contacts.sidebar.localAll')
    if (sel === 'local:manual') return $_('contacts.sidebar.localManual')
    if (sel === 'local:collected') return $_('contacts.sidebar.localCollected')
    const src = contactSourcesStore.sources.find(s => s.id === sel)
    return src?.name || $_('contacts.list.header')
  })
</script>

<div class="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
  <ListHeader label={headerLabel} count={contactsView.contacts.length}>
    {#snippet actions()}
      <ToolbarButton
        icon="mdi:magnify"
        label={showSearch ? $_('contacts.list.searchClose') : $_('contacts.list.searchOpen')}
        aria-pressed={showSearch}
        onclick={() => showSearch ? clearSearch() : toggleSearchFocus()}
      />
      <ToolbarButton
        icon={sortOrder === 'name-asc' ? 'mdi:sort-alphabetical-ascending' : 'mdi:sort-alphabetical-descending'}
        label={sortOrder === 'name-asc' ? $_('contacts.list.sortAsc') : $_('contacts.list.sortDesc')}
        onclick={toggleSort}
      />
      {#if onAdd}
        <ToolbarButton icon="mdi:plus" label={$_('contacts.list.addTooltip')} onclick={onAdd} />
      {/if}
    {/snippet}
  </ListHeader>

  {#if showSearch}
    <div class="flex shrink-0 items-center gap-1.5 border-b px-3 py-2">
      <div class="relative min-w-0 flex-1">
        <Icon icon="mdi:magnify" class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          bind:ref={searchInputEl}
          type="text"
          aria-label={$_('contacts.list.searchPlaceholder')}
          placeholder={$_('contacts.list.searchPlaceholder')}
          class="h-8 pl-8"
          value={searchInput}
          oninput={onSearchInput}
          onkeydown={handleSearchKeydown}
        />
      </div>
      {#if searchInput}
        <ToolbarButton icon="mdi:close" label={$_('contacts.list.searchClear')} onclick={clearSearch} />
      {/if}
    </div>
  {/if}

  <WriteAccessBanner />

  <ListPane
    items={sortedContacts}
    selectedId={contactsView.selectedContactId}
    focusSlot="messageList"
    label={$_('contacts.list.label')}
    loading={contactsView.loading}
    onSelect={(id) => focusContact(id)}
    onActivate={(id) => activateContact(id)}
    onDelete={requestDelete}
    onFocusSearch={toggleSearchFocus}
  >
    {#snippet row(c: v1.Contact, { selected })}
      <ListRow {selected} onclick={() => activateContact(c.id)}>
        <Avatar email={primaryEmail(c)} name={c.name} density="standard" photoData={c.photoData} photoMediaType={c.photoMediaType} />
        <span class="flex flex-col min-w-0 flex-1">
          <span class="font-medium truncate text-foreground">{c.name || primaryEmail(c) || $_('contacts.common.unnamed')}</span>
          {#if primaryEmail(c) && primaryEmail(c) !== c.name}
            <span class="text-xs text-muted-foreground truncate">{primaryEmail(c)}</span>
          {/if}
        </span>
      </ListRow>
    {/snippet}

    {#snippet empty()}
      <Empty.Root>
        <Empty.Header>
          <Empty.Media variant="icon"><Icon icon={searchInput ? 'mdi:magnify' : 'mdi:account-multiple'} aria-hidden="true" /></Empty.Media>
          <Empty.Description>{searchInput ? $_('contacts.list.emptySearch') : $_('contacts.list.empty')}</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/snippet}

    {#snippet footer()}
      {#if contactsView.hasMore}
        <Button variant="ghost" size="sm" class="w-full"
          disabled={contactsView.loadingMore}
          onclick={() => loadMoreContacts()}
        >
          {$_('contacts.list.loadMore')}
        </Button>
      {/if}
    {/snippet}
  </ListPane>
</div>

<ConfirmDialog
  bind:open={showDeleteConfirm}
  title={$_('contacts.delete.title')}
  description={pendingDelete
    ? $_(
        pendingDelete.sourceId === 'aerion'
          ? 'contacts.delete.descriptionLocal'
          : 'contacts.delete.descriptionCardDAV',
        {
          values: {
            name: pendingDelete.name || (pendingDelete.emails && pendingDelete.emails[0]) || $_('contacts.common.unnamed'),
          },
        },
      )
    : ''}
  confirmLabel={$_('contacts.common.delete')}
  cancelLabel={$_('contacts.common.cancel')}
  variant="destructive"
  loading={deleting}
  onConfirm={confirmDelete}
/>

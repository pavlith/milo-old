<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { account, folder } from '$lib/models'
  import { getUIStateVersion, isUnifiedInboxExpanded, setUnifiedInboxExpanded } from '$lib/stores/uiState.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import FolderContextMenu from './FolderContextMenu.svelte'
  import { _ } from '$lib/i18n'

  interface AccountWithInbox {
    account: account.Account
    inbox: folder.Folder | null
  }

  interface Props {
    accounts: AccountWithInbox[]
    unifiedUnreadCount: number
    selectedAccountId: string | null
    selectedFolderId: string | null
    selectionSource: 'unified' | 'account' | null
    onSelectUnified: () => void
    onSelectAccountInbox: (accountId: string, folderId: string, folderPath: string) => void
  }

  let {
    accounts,
    unifiedUnreadCount,
    selectedAccountId,
    selectedFolderId,
    selectionSource,
    onSelectUnified,
    onSelectAccountInbox,
  }: Props = $props()

  // Initialize from persisted state (defaults to true)
  let expanded = $state(isUnifiedInboxExpanded())
  $effect(() => {
    getUIStateVersion()
    expanded = isUnifiedInboxExpanded()
  })

  // Check if unified inbox is selected (All Inboxes)
  const isUnifiedSelected = $derived(selectedAccountId === 'unified' && selectedFolderId === 'inbox')

  // Check if a specific account inbox is selected IN THE UNIFIED SECTION
  // Only highlight if selectionSource is 'unified'
  function isAccountInboxSelected(accountId: string, inboxId: string): boolean {
    return selectionSource === 'unified' && selectedAccountId === accountId && selectedFolderId === inboxId
  }

  // Toggle expand/collapse and persist
  function toggleExpanded() {
    expanded = !expanded
    setUnifiedInboxExpanded(expanded)
  }

  function handleUnifiedClick() {
    onSelectUnified()
  }

  function handleAccountInboxClick(acc: AccountWithInbox) {
    if (acc.inbox) {
      onSelectAccountInbox(acc.account.id, acc.inbox.id, acc.inbox.path)
    }
  }

  // Get account color with fallback
  function getAccountColor(acc: account.Account): string {
    // @ts-ignore - color field from backend
    return acc.color || 'var(--muted-foreground)'
  }
</script>

<Sidebar.Group class="p-0">
  <div class="relative">
    <Sidebar.MenuButton
      isActive={isUnifiedSelected}
      aria-current={isUnifiedSelected ? 'true' : undefined}
      class="pr-8 focus-visible:ring-inset"
      data-sidebar-item="unified"
      onclick={handleUnifiedClick}
    >
      <Icon icon="mdi:inbox-multiple" />
      <span class="min-w-0 flex-1 truncate">{$_('sidebar.allInboxes')}</span>
      {#if unifiedUnreadCount > 0}
        <Badge variant="secondary" class="h-4 px-1.5 tabular-nums">{unifiedUnreadCount}</Badge>
      {/if}
    </Sidebar.MenuButton>
    <Button
      variant="ghost"
      size="icon"
      class="absolute right-1 top-1/2 size-6 -translate-y-1/2"
      aria-label={$_('sidebar.allInboxes')}
      aria-expanded={expanded}
      onclick={toggleExpanded}
    >
      <Icon icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} class="size-4" />
    </Button>
  </div>

  {#if expanded}
    <div class="ml-3 border-l border-sidebar-border pl-1">
      {#each accounts as acc (acc.account.id)}
        {#if acc.inbox}
          {@const selected = isAccountInboxSelected(acc.account.id, acc.inbox.id)}
          <FolderContextMenu folderId={acc.inbox.id}>
            <Sidebar.MenuButton
              isActive={selected}
              aria-current={selected ? 'true' : undefined}
              class="focus-visible:ring-inset"
              data-sidebar-item="unified-account"
              data-folder-id={acc.inbox.id}
              onclick={() => handleAccountInboxClick(acc)}
            >
              <span class="size-2 shrink-0 rounded-full" style:background-color={getAccountColor(acc.account)}></span>
              <span class="min-w-0 flex-1 truncate">{acc.account.name}</span>
              {#if acc.inbox.unreadCount > 0}
                <Badge variant="secondary" class="h-4 px-1.5 tabular-nums">{acc.inbox.unreadCount}</Badge>
              {/if}
            </Sidebar.MenuButton>
          </FolderContextMenu>
        {/if}
      {/each}
    </div>
  {/if}
</Sidebar.Group>

<script lang="ts">
  import Icon from '@iconify/svelte'
  import { account, folder } from '$lib/models'
  import FolderTreeItem from './FolderTreeItem.svelte'
  import { _ } from '$lib/i18n'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { buttonVariants } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'

  interface Props {
    account: account.Account
    folders: folder.FolderTree[]
    loading: boolean
    syncing: boolean
    error: string | null
    selectedFolderId: string
    selectionSource: 'unified' | 'account' | null
    isHeaderFocused?: boolean
    isExpanded?: boolean
    syncError?: { folderId: string; error: string } | null
    onFolderSelect?: (accountId: string, folderId: string, folderPath: string, folderName: string, folderType: string) => void
    onToggleExpanded?: () => void
    onEdit?: () => void
    onDelete?: () => void
    onSync?: () => void
    collapsedFolders?: Record<string, boolean>
    onToggleFolderCollapse?: (folderId: string) => void
    onMessagesMoved?: () => void
  }

  let {
    account: acc,
    folders,
    loading,
    syncing,
    error,
    selectedFolderId,
    selectionSource,
    isHeaderFocused = false,
    isExpanded = true,
    syncError = null,
    onFolderSelect,
    onToggleExpanded,
    onEdit,
    onDelete,
    onSync,
    collapsedFolders = {},
    onToggleFolderCollapse,
    onMessagesMoved,
  }: Props = $props()

  // Toggle expand/collapse via callback
  function toggleExpanded() {
    onToggleExpanded?.()
  }

  function selectFolder(f: folder.Folder) {
    onFolderSelect?.(acc.id, f.id, f.path, f.name, f.type)
  }
</script>

<Sidebar.Group class="p-0">
  <!-- Account Header -->
  <div class="relative group">
    <Sidebar.MenuButton
      isActive={isHeaderFocused}
      class="pr-8 font-medium focus-visible:ring-inset"
      aria-expanded={isExpanded}
      data-sidebar-item="account-header"
      data-account-id={acc.id}
      onclick={toggleExpanded}
    >
      <Icon
        icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
        class="w-4 h-4 text-muted-foreground"
      />
      <Icon icon="mdi:email-outline" class="w-4 h-4" />
      <span class="truncate flex-1 text-left">{acc.name}</span>

      {#if syncing}
        <Icon icon="mdi:sync" class="w-4 h-4 animate-spin text-muted-foreground" />
      {:else if error}
        <span title={error}>
          <Icon icon="mdi:alert-circle" class="w-4 h-4 text-destructive" />
        </span>
      {/if}
    </Sidebar.MenuButton>

    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute right-1 top-1/2 size-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100')}
        aria-label={`${acc.name}: ${$_('aria.accountActions')}`}
      >
        <Icon icon="mdi:dots-vertical" class="size-4" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item class="gap-2 px-3 py-2" onSelect={onSync}>
          <Icon icon="mdi:sync" class="size-4" />
          <span>{$_('sidebar.syncNow')}</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item class="gap-2 px-3 py-2" onSelect={onEdit}>
          <Icon icon="mdi:pencil-outline" class="size-4" />
          <span>{$_('sidebar.editAccount')}</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item class="gap-2 px-3 py-2 data-highlighted:bg-destructive data-highlighted:text-destructive-foreground" onSelect={onDelete}>
          <Icon icon="mdi:delete-outline" class="size-4" />
          <span>{$_('sidebar.deleteAccount')}</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <!-- Sync Error — bar removed; spinner in header + phase label in bottom status convey sync state. -->
  {#if syncError}
    <div class="px-3 py-1.5">
      <div class="flex items-center gap-2 text-destructive">
        <Icon icon="mdi:alert-circle" class="w-4 h-4 flex-shrink-0" />
        <p class="text-xs">{$_('sidebar.syncError')}</p>
      </div>
    </div>
  {/if}

  <!-- Folder List -->
  {#if isExpanded}
    <div class="ml-3 border-l border-sidebar-border pl-1">
      {#if loading}
        <div class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
          <Icon icon="mdi:loading" class="w-4 h-4 animate-spin" />
          <span>{$_('sidebar.loadingFolders')}</span>
        </div>
      {:else if folders.length === 0}
        <div class="px-3 py-2 text-sm text-muted-foreground">
          {$_('sidebar.noFoldersSynced')}
        </div>
      {:else}
        {#each folders as tree (tree.folder?.id ?? 'unknown')}
          <FolderTreeItem
            {tree}
            accountId={acc.id}
            {selectedFolderId}
            {selectionSource}
            {collapsedFolders}
            {onMessagesMoved}
            onFolderSelect={(f) => selectFolder(f)}
            onToggleCollapse={(folderId) => onToggleFolderCollapse?.(folderId)}
          />
        {/each}
      {/if}
    </div>
  {/if}
</Sidebar.Group>

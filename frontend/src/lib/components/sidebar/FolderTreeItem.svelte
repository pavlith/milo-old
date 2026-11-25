<script lang="ts">
  import { present } from '$lib/bindingValues'
  import Icon from '@iconify/svelte'
  import { folder } from '$lib/models'
  import { MoveToFolder, Undo } from '$bindings/github.com/pavlith/milo/app/app'
  import FolderContextMenu from './FolderContextMenu.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import Self from './FolderTreeItem.svelte'
  import { toasts } from '$lib/stores/toast'
  import { _ } from '$lib/i18n'

  interface Props {
    tree: folder.FolderTree
    accountId: string
    selectedFolderId: string
    selectionSource: 'unified' | 'account' | null
    collapsedFolders: Record<string, boolean>
    onFolderSelect?: (f: folder.Folder) => void
    onToggleCollapse?: (folderId: string) => void
    onMessagesMoved?: () => void
  }

  let {
    tree,
    accountId,
    selectedFolderId,
    selectionSource,
    collapsedFolders,
    onFolderSelect,
    onToggleCollapse,
    onMessagesMoved,
  }: Props = $props()

  // Folder type to icon mapping
  const folderIcons: Record<string, string> = {
    inbox: 'mdi:inbox',
    sent: 'mdi:send',
    drafts: 'mdi:file-document-edit-outline',
    trash: 'mdi:delete-outline',
    archive: 'mdi:archive-outline',
    spam: 'mdi:alert-octagon-outline',
    all: 'mdi:email-multiple-outline',
    folder: 'mdi:folder-outline',
  }

  function getFolderIcon(type: string): string {
    return folderIcons[type] || folderIcons.folder
  }

  function isFolderSelected(folderId: string): boolean {
    return selectionSource === 'account' && selectedFolderId === folderId
  }

  let hasChildren = $derived(tree.children && tree.children.length > 0)
  let isCollapsed = $derived(
    hasChildren
      ? collapsedFolders[tree.folder!.id] !== false  // collapsed unless explicitly set to false
      : false
  )

  // Drag-and-drop state for receiving message drops on this folder
  let isDragOver = $state(false)

  function hasMessagesPayload(e: DragEvent): boolean {
    return !!e.dataTransfer?.types.includes('application/x-milo-messages')
  }

  function handleDragEnter(e: DragEvent) {
    if (!hasMessagesPayload(e)) return
    e.preventDefault()
    isDragOver = true
  }

  function handleDragOver(e: DragEvent) {
    if (!hasMessagesPayload(e)) return
    e.preventDefault()  // required to allow drop
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  }

  function handleDragLeave() {
    isDragOver = false
  }

  async function handleDrop(e: DragEvent) {
    isDragOver = false
    const raw = e.dataTransfer?.getData('application/x-milo-messages')
    if (!raw || !tree.folder) return
    e.preventDefault()

    let payload: { messageIds: string[]; sourceAccountId: string }
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }
    if (!payload.messageIds || payload.messageIds.length === 0) return

    // Same-folder drop: no-op
    if (tree.folder.id === selectedFolderId && selectionSource === 'account') {
      return
    }

    const folderName = tree.folder.name
    try {
      await MoveToFolder(payload.messageIds, tree.folder.id)
      onMessagesMoved?.()
      toasts.success($_('toast.movedTo', { values: { folder: folderName } }), [
        { label: $_('common.undo'), onClick: handleUndo },
      ])
    } catch (err) {
      console.error('Drag-drop move failed:', err)
      toasts.error($_('toast.failedToMove'))
    }
  }

  async function handleUndo() {
    try {
      await Undo()
    } catch (err) {
      console.error('Undo failed:', err)
      toasts.error($_('toast.undoFailed'))
    }
  }
</script>

{#if tree.folder}
  <div class="relative">
    <FolderContextMenu folderId={tree.folder.id}>
      <Sidebar.MenuButton
        class={cn('focus-visible:ring-inset', hasChildren && 'pr-8', isDragOver && 'ring-2 ring-primary ring-inset')}
        isActive={isFolderSelected(tree.folder.id)}
        aria-current={isFolderSelected(tree.folder.id) ? 'true' : undefined}
        data-sidebar-item="folder"
        data-folder-id={tree.folder.id}
        data-has-children={hasChildren ? 'true' : undefined}
        onclick={() => onFolderSelect?.(tree.folder!)}
        ondragenter={handleDragEnter}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
      >
        <Icon icon={getFolderIcon(tree.folder.type)} />
        <span class="min-w-0 flex-1 truncate">{tree.folder.name}</span>
        {#if tree.folder.unreadCount > 0}
          <Badge variant="secondary" class="h-4 px-1.5 tabular-nums">{tree.folder.unreadCount}</Badge>
        {/if}
      </Sidebar.MenuButton>
    </FolderContextMenu>
    {#if hasChildren}
      <Button
        variant="ghost"
        size="icon"
        class="absolute right-1 top-1/2 size-6 -translate-y-1/2"
        aria-label={tree.folder.name}
        aria-expanded={!isCollapsed}
        onclick={() => onToggleCollapse?.(tree.folder!.id)}
      >
        <Icon icon={isCollapsed ? 'mdi:chevron-right' : 'mdi:chevron-down'} class="size-4" />
      </Button>
    {/if}
  </div>

  {#if hasChildren && !isCollapsed}
    <div class="ml-3 border-l border-sidebar-border pl-1">
      {#each present(tree.children) as childTree (childTree.folder?.id ?? 'unknown')}
        <Self
          tree={childTree}
          {accountId}
          {selectedFolderId}
          {selectionSource}
          {collapsedFolders}
          {onFolderSelect}
          {onToggleCollapse}
          {onMessagesMoved}
        />
      {/each}
    </div>
  {/if}
{/if}

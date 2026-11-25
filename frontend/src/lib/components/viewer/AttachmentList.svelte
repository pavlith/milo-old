<script lang="ts">
  import { present } from '$lib/bindingValues'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import Icon from '@iconify/svelte'
  import { GetAttachments, SaveAttachmentAs, SaveAllAttachments, OpenAttachment, SaveEncryptedAttachmentAs, OpenEncryptedAttachment, SaveAllEncryptedAttachments, OpenFile, OpenFolder } from '$bindings/github.com/pavlith/milo/app/app'
  import { message as messageModels } from '$lib/models'
  import { toasts } from '$lib/stores/toast'
  import { _ } from '$lib/i18n'

  // Decrypted attachment metadata (from encrypted messages, not in DB)
  interface DecryptedAttachment {
    filename: string
    contentType: string
    size: number
    isInline: boolean
    contentId: string
  }

  interface Props {
    messageId: string
    encryptedAttachments?: DecryptedAttachment[]
  }

  let { messageId, encryptedAttachments }: Props = $props()

  // State
  let attachments = $state<messageModels.Attachment[]>([])
  let loading = $state(false)
  let downloadingIds = $state<Set<string>>(new Set())
  let savingAll = $state(false)

  // Determine if we're in encrypted mode
  let isEncrypted = $derived(encryptedAttachments != null && encryptedAttachments.length > 0)

  // Load attachments when messageId changes (only for non-encrypted)
  $effect(() => {
    if (encryptedAttachments && encryptedAttachments.length > 0) {
      attachments = []
      return
    }
    if (messageId) {
      loadAttachments(messageId)
    } else {
      attachments = []
    }
  })

  async function loadAttachments(msgId: string) {
    loading = true
    try {
      const result = present(await GetAttachments(msgId))
      attachments = result || []
    } catch (err) {
      console.error('Failed to load attachments:', err)
      attachments = []
    } finally {
      loading = false
    }
  }

  async function handleDownload(att: messageModels.Attachment) {
    downloadingIds = new Set([...downloadingIds, att.id])
    try {
      const path = await SaveAttachmentAs(att.id)
      if (path) {
        toasts.success($_('toast.attachmentSaved', { values: { filename: att.filename } }), [
          {
            label: $_('attachment.openFile'),
            onClick: () => OpenFile(path)
          },
          {
            label: $_('attachment.showInFolder'),
            onClick: () => OpenFolder(path)
          }
        ])
      }
    } catch (err) {
      console.error('Failed to save attachment:', err)
      toasts.error($_('toast.failedToSaveAttachment', { values: { filename: att.filename } }))
    } finally {
      downloadingIds = new Set([...downloadingIds].filter(id => id !== att.id))
    }
  }

  async function handleOpen(att: messageModels.Attachment) {
    downloadingIds = new Set([...downloadingIds, att.id])
    try {
      await OpenAttachment(att.id)
    } catch (err) {
      console.error('Failed to open attachment:', err)
      toasts.error($_('toast.failedToOpenAttachment', { values: { filename: att.filename } }))
    } finally {
      downloadingIds = new Set([...downloadingIds].filter(id => id !== att.id))
    }
  }

  async function handleEncryptedDownload(att: DecryptedAttachment) {
    const key = att.filename
    downloadingIds = new Set([...downloadingIds, key])
    try {
      const path = await SaveEncryptedAttachmentAs(messageId, att.filename)
      if (path) {
        toasts.success($_('toast.attachmentSaved', { values: { filename: att.filename } }), [
          {
            label: $_('attachment.openFile'),
            onClick: () => OpenFile(path)
          },
          {
            label: $_('attachment.showInFolder'),
            onClick: () => OpenFolder(path)
          }
        ])
      }
    } catch (err) {
      console.error('Failed to save encrypted attachment:', err)
      toasts.error($_('toast.failedToSaveAttachment', { values: { filename: att.filename } }))
    } finally {
      downloadingIds = new Set([...downloadingIds].filter(id => id !== key))
    }
  }

  async function handleEncryptedOpen(att: DecryptedAttachment) {
    const key = att.filename
    downloadingIds = new Set([...downloadingIds, key])
    try {
      await OpenEncryptedAttachment(messageId, att.filename)
    } catch (err) {
      console.error('Failed to open encrypted attachment:', err)
      toasts.error($_('toast.failedToOpenAttachment', { values: { filename: att.filename } }))
    } finally {
      downloadingIds = new Set([...downloadingIds].filter(id => id !== key))
    }
  }

  async function handleSaveAll() {
    savingAll = true
    try {
      if (isEncrypted) {
        const folder = await SaveAllEncryptedAttachments(messageId)
        if (folder) {
          toasts.success($_('toast.attachmentsSaved', { values: { count: encryptedAttachments!.length } }), [
            {
              label: $_('attachment.openFolder'),
              onClick: () => OpenFolder(folder)
            }
          ])
        }
      } else {
        const folder = await SaveAllAttachments(messageId)
        if (folder) {
          toasts.success($_('toast.attachmentsSaved', { values: { count: attachments.length } }), [
            {
              label: $_('attachment.openFolder'),
              onClick: () => OpenFolder(folder)
            }
          ])
        }
      }
    } catch (err) {
      console.error('Failed to save all attachments:', err)
      toasts.error($_('toast.failedToSaveAttachments'))
    } finally {
      savingAll = false
    }
  }

  function getFileIcon(contentType: string): string {
    if (contentType.startsWith('image/')) return 'mdi:file-image'
    if (contentType.startsWith('video/')) return 'mdi:file-video'
    if (contentType.startsWith('audio/')) return 'mdi:file-music'
    if (contentType === 'application/pdf') return 'mdi:file-pdf-box'
    if (contentType.includes('word') || contentType === 'application/msword') return 'mdi:file-word'
    if (contentType.includes('excel') || contentType === 'application/vnd.ms-excel') return 'mdi:file-excel'
    if (contentType.includes('powerpoint') || contentType === 'application/vnd.ms-powerpoint') return 'mdi:file-powerpoint'
    if (contentType.includes('zip') || contentType.includes('compressed')) return 'mdi:folder-zip'
    if (contentType === 'text/plain') return 'mdi:file-document-outline'
    if (contentType === 'text/html') return 'mdi:language-html5'
    return 'mdi:file'
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
</script>

{#snippet attachment(
  file: DecryptedAttachment | messageModels.Attachment,
  isDownloading: boolean,
  onOpen: () => void,
  onDownload: () => void,
)}
  <div class="flex items-center gap-3 rounded-lg border bg-card p-2 text-card-foreground">
    <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon icon={getFileIcon(file.contentType)} class="size-5 text-muted-foreground" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-medium" title={file.filename}>{file.filename}</div>
      <div class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {formatSize(file.size)}
        {#if file.isInline && !isEncrypted}
          <Badge variant="secondary" class="h-4 px-1.5">{$_('attachment.inline')}</Badge>
        {/if}
      </div>
    </div>
    {#if isDownloading}
      <Icon icon="mdi:loading" class="mx-2 size-4 shrink-0 animate-spin text-muted-foreground" aria-label={$_('common.loading')} />
    {:else}
      <div class="flex shrink-0 items-center gap-1">
        <ToolbarButton icon="mdi:open-in-new" label={$_('attachment.open')} onclick={onOpen} />
        <ToolbarButton icon="mdi:download" label={$_('attachment.download')} onclick={onDownload} />
      </div>
    {/if}
  </div>
{/snippet}

{#if loading && !isEncrypted}
  <div role="status" class="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon icon="mdi:loading" class="size-4 animate-spin" />
    {$_('common.loading')}
  </div>
{:else if isEncrypted || attachments.length > 0}
  {@const count = isEncrypted ? encryptedAttachments?.length ?? 0 : attachments.length}
  <div class="flex flex-col gap-2">
    {#if isEncrypted && encryptedAttachments}
      {#each encryptedAttachments as file (file.filename)}
        {@render attachment(file, downloadingIds.has(file.filename), () => handleEncryptedOpen(file), () => handleEncryptedDownload(file))}
      {/each}
    {:else}
      {#each attachments as file (file.id)}
        {@render attachment(file, downloadingIds.has(file.id), () => handleOpen(file), () => handleDownload(file))}
      {/each}
    {/if}

    {#if count > 1}
      <Button variant="outline" size="sm" class="gap-2 self-start" onclick={handleSaveAll} disabled={savingAll}>
        <Icon
          icon={savingAll ? 'mdi:loading' : 'mdi:download-multiple'}
          class={savingAll ? 'size-4 animate-spin' : 'size-4'}
          data-icon="inline-start"
        />
        {savingAll ? $_('attachment.saving') : $_('attachment.saveAll', { values: { count } })}
      </Button>
    {/if}
  </div>
{/if}

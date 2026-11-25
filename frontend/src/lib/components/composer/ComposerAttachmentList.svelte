<script lang="ts">
  import Icon from '@iconify/svelte'
  import { formatFileSize, getFileIcon } from './composerUtils'
  import { Button } from '$lib/components/ui/button'
  import { _ } from '$lib/i18n'

  interface Attachment {
    filename: string
    contentType: string
    size: number
    data: string
  }

  interface Props {
    attachments: Attachment[]
    onRemove: (index: number) => void
  }

  let { attachments, onRemove }: Props = $props()
</script>

{#if attachments.length > 0}
  <div class="px-4 py-2 border-t border-border bg-muted/30">
    <div class="flex flex-wrap gap-2">
      {#each attachments as attachment, index (index)}
        <div class="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-sm">
          <Icon icon={getFileIcon(attachment.contentType)} class="size-4 text-muted-foreground" />
          <span class="max-w-[150px] truncate" title={attachment.filename}>
            {attachment.filename}
          </span>
          <span class="text-xs text-muted-foreground">
            ({formatFileSize(attachment.size)})
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            class="size-6 text-muted-foreground hover:text-destructive"
            onclick={() => onRemove(index)}
            title={$_('attachment.removeAttachment')}
            aria-label={$_('attachment.removeAttachment') + ': ' + attachment.filename}
          >
            <Icon icon="mdi:close" class="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      {/each}
    </div>
  </div>
{/if}

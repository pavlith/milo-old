<script lang="ts">
  // SidebarSyncStatus — generic sidebar-footer sync affordance for ANY
  // extension (mail-style: status + action in one). Renders the canonical
  // status line — sync icon + label, spinner while syncing, alert in an error
  // state — and, when `onSync` is provided, makes the whole line a clickable
  // "sync now" button (disabled while syncing). Lives in the kit because it's
  // fully generic: all labels are passed in, so it carries no i18n and no
  // extension-specific knowledge. Drop it into a SidebarFooter `leading` slot.
  import { Button } from '$lib/components/ui/button'
  import Icon from '@iconify/svelte'

  interface Props {
    /** True while a sync is in flight — shows the spinner + disables the action. */
    syncing: boolean
    /** Label shown when idle (and not in an error state). */
    idleLabel: string
    /** Label shown while syncing. */
    syncingLabel: string
    /** When provided, the line becomes a clickable sync button. Omit for a
     *  passive status indicator. */
    onSync?: () => void
    /** When set (and not syncing), renders the error state instead of idle. */
    errorLabel?: string
    /** Optional full error text shown as the tooltip in the error state. */
    errorDetail?: string
  }

  let { syncing, idleLabel, syncingLabel, onSync, errorLabel, errorDetail }: Props = $props()
</script>

{#snippet content()}
  {#if syncing}
    <Icon icon="mdi:sync" class="size-4 shrink-0 animate-spin" />
    <span class="truncate">{syncingLabel}</span>
  {:else if errorLabel}
    <Icon icon="mdi:alert-circle" class="size-4 shrink-0 text-destructive" />
    <span class="truncate text-destructive">{errorLabel}</span>
  {:else}
    <Icon icon="mdi:sync" class="size-4 shrink-0" />
    <span class="truncate">{idleLabel}</span>
  {/if}
{/snippet}

{#if onSync}
  <Button
    variant="ghost"
    size="sm"
    class="h-8 min-w-0 flex-1 justify-start gap-2 px-1 text-xs"
    onclick={onSync}
    disabled={syncing}
    title={errorDetail}
  >
    {@render content()}
  </Button>
{:else}
  <div class="flex items-center gap-2 min-w-0 flex-1" title={errorDetail}>
    {@render content()}
  </div>
{/if}

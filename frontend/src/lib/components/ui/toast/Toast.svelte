<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { Toast } from '$lib/stores/toast'
  import { Button } from '$lib/components/ui/button'
  import { _ } from '$lib/i18n'

  interface Props {
    toast: Toast
    onClose: () => void
  }

  let { toast, onClose }: Props = $props()

  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    info: 'mdi:information',
    warning: 'mdi:alert'
  }

  const colors = {
    success: 'bg-success-surface border-success/30',
    error: 'bg-error-surface border-error/30',
    info: 'bg-info-surface border-info/30',
    warning: 'bg-warning-surface border-warning/30'
  }

  const iconColors = {
    success: 'text-success',
    error: 'text-error',
    info: 'text-info',
    warning: 'text-warning'
  }
</script>

<div
  class="flex items-start gap-2 p-3 rounded-md border shadow-sm {colors[toast.type]}"
  role="alert"
>
  <Icon icon={icons[toast.type]} class="w-5 h-5 flex-shrink-0 mt-0.5 {iconColors[toast.type]}" />

  <div class="flex-1 min-w-0">
    <p class="text-sm text-foreground">{toast.message}</p>

    {#if toast.actions && toast.actions.length > 0}
      <div class="flex gap-2 mt-2">
        {#each toast.actions as action (action.label)}
          <Button variant="ghost" size="sm"
            class="text-xs"
            onclick={action.onClick}
          >
            {action.label}
          </Button>
        {/each}
      </div>
    {/if}
  </div>

  <Button variant="ghost" size="icon-sm"
    class="size-6"
    onclick={onClose}
    aria-label={$_('aria.dismiss')}
  >
    <Icon icon="mdi:close" class="w-4 h-4 text-muted-foreground" />
  </Button>
</div>

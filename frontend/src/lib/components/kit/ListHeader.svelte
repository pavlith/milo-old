<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import ResponsiveSidebarToggle from './ResponsiveSidebarToggle.svelte'

  interface Props {
    label: string
    count?: number | null
    description?: string
    searchMode?: boolean
    search?: Snippet
    actions?: Snippet
    showSidebarToggle?: boolean
    onToggleSidebar?: () => void
  }

  const {
    label, count = null, description, searchMode = false, search, actions,
    showSidebarToggle = true, onToggleSidebar,
  }: Props = $props()
</script>

<header class="flex min-h-[52px] shrink-0 items-center justify-between gap-2 px-3 py-2">
  <div class="flex min-w-0 flex-1 items-center gap-2">
    {#if showSidebarToggle}
      <ResponsiveSidebarToggle onclick={onToggleSidebar} />
    {/if}
    {#if searchMode && search}
      {@render search()}
    {:else}
      <div class="min-w-0">
        <h2 class="truncate text-base font-semibold leading-tight" title={label}>{label}</h2>
        {#if description}
          <p class="truncate text-xs text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if count != null}
        <Badge variant="secondary" class="shrink-0 tabular-nums">{count}</Badge>
      {/if}
    {/if}
  </div>
  {#if actions}
    <div class="flex shrink-0 items-center gap-0.5">
      {@render actions()}
    </div>
  {/if}
</header>
<Separator />

<script lang="ts">
  import type { Snippet } from 'svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'

  interface Props {
    /** Left-side content: status icon + label, or any consumer-defined
     *  affordance. 1 or 2 lines — the wrapper's min-h handles either. */
    leading: Snippet
    /** Right-side content: cog button, sync action, etc. Wrapped in a
     *  shrink-0 row so it never gets crowded out by long leading labels. */
    trailing?: Snippet
    /** Optional absolutely-positioned overlay (top-0, h-1 progress bar
     *  for mail's sync indicator). Renders before the row content so it
     *  sits visually behind. */
    overlay?: Snippet
  }

  let { leading, trailing, overlay }: Props = $props()
</script>

<Sidebar.Footer
  class="relative shrink-0 flex-row p-3 border-t border-border text-xs text-muted-foreground
         flex items-center justify-between gap-2 min-h-[52px]"
>
  {#if overlay}
    {@render overlay()}
  {/if}
  <div class="flex items-center gap-2 min-w-0 flex-1">
    {@render leading()}
  </div>
  {#if trailing}
    <div class="flex shrink-0 items-center gap-1">
      {@render trailing()}
    </div>
  {/if}
</Sidebar.Footer>

<script lang="ts">
  // ListRow — generic horizontal row with hover/selected/density styling.
  //
  // Rendered as a non-focusable <div role="option"> rather than a <button>
  // so DOM focus stays on the parent ListPane container during keyboard
  // navigation. If rows were buttons, clicking one would move DOM focus to
  // that button, then arrow keys would leave the previous button visually
  // focused (with a residual outline) even after selection moved.

  import { listRowVariants } from './listRowVariants'
  import type { Snippet } from 'svelte'

  type Density = 'micro' | 'compact' | 'standard' | 'large'

  interface Props {
    selected?: boolean
    density?: Density
    onclick?: (e: MouseEvent) => void
    children: Snippet
  }

  const { selected = false, density = 'standard', onclick, children }: Props = $props()

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
  role="option"
  aria-selected={selected}
  class={listRowVariants({ density, selected, class: 'items-center select-none' })}
  {onclick}
>
  {@render children()}
</div>

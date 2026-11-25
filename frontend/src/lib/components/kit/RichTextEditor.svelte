<script lang="ts">
  import EditorToolbar from './EditorToolbar.svelte'
  import { onMount } from 'svelte'
  import { Editor } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import Underline from '@tiptap/extension-underline'
  import Link from '@tiptap/extension-link'
  import Placeholder from '@tiptap/extension-placeholder'

  interface Props {
    /** Initial HTML used at mount time. Reseeding mid-life goes through setContent(). */
    value?: string
    /** Fired on every edit with the current HTML and its plaintext rendering. */
    onChange?: (html: string, text: string) => void
    /** When true the editor is read-only and the toolbar is disabled. */
    disabled?: boolean
    /** Placeholder shown while empty. */
    placeholder?: string
  }

  let { value = '', onChange, disabled = false, placeholder = '' }: Props = $props()

  let element: HTMLDivElement
  // $state.raw, NOT $state: a TipTap Editor must never be wrapped in Svelte's
  // deep reactive proxy — it proxies ProseMirror's internal state, corrupts the
  // editor, and leaks proxied objects into the reactive graph across mount/
  // destroy cycles (symptom: detail pane reactivity freezing after repeated
  // open/cancel). Reassignment (editor = …) is still reactive with .raw.
  let editor = $state.raw<Editor | null>(null)

  onMount(() => {
    editor = new Editor({
      element,
      editable: !disabled,
      extensions: [
        StarterKit,
        Underline,
        Link.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder }),
      ],
      content: value ?? '',
      editorProps: {
        attributes: {
          class: 'rte-content focus:outline-hidden',
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange?.(ed.getHTML(), ed.getText())
      },
    })

    return () => {
      editor?.destroy()
      editor = null
    }
  })

  // No reactive content-syncing: the dialog remounts this editor each time it
  // opens, so onMount's `content: value` seeds it fresh. `value` must be ready
  // before mount — the parent passes a $derived for that. (A reactive seed that
  // calls setContent on every value/editor change churned the scheduler and
  // froze the dialog.)
  $effect(() => {
    editor?.setEditable(!disabled)
  })

</script>

<div class="rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
  <EditorToolbar {editor} variant="basic" {disabled} />
  <div bind:this={element} class="rte-editor max-h-60 overflow-y-auto text-sm text-foreground"></div>
</div>

<style>
  /* Guarantee a visible, clickable editing area even when empty. min-height
     on the wrapper covers the brief window before ProseMirror mounts; the
     ProseMirror node itself fills the wrapper so a click anywhere focuses it. */
  .rte-editor {
    min-height: 6rem;
    cursor: text;
  }
  .rte-editor :global(.ProseMirror) {
    min-height: 6rem;
    padding: 0.375rem 0.5rem;
    outline: none;
  }
  .rte-editor :global(p) {
    margin: 0 0 0.5rem;
  }
  .rte-editor :global(p:last-child) {
    margin-bottom: 0;
  }
  .rte-editor :global(ul),
  .rte-editor :global(ol) {
    margin: 0 0 0.5rem;
    padding-left: 1.25rem;
  }
  .rte-editor :global(ul) {
    list-style: disc;
  }
  .rte-editor :global(ol) {
    list-style: decimal;
  }
  .rte-editor :global(a) {
    color: hsl(var(--primary));
    text-decoration: underline;
  }
  .rte-editor :global(.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    color: hsl(var(--muted-foreground));
  }
</style>

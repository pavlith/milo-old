<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import EditorToolbar from '$lib/components/kit/EditorToolbar.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Separator } from '$lib/components/ui/separator'
  import Icon from '@iconify/svelte'
  import { Editor, Extension } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import Underline from '@tiptap/extension-underline'
  import Placeholder from '@tiptap/extension-placeholder'
  import TextAlign from '@tiptap/extension-text-align'
  import TableRow from '@tiptap/extension-table-row'
  import FontSize from 'tiptap-extension-font-size'
  import { _ } from '$lib/i18n'
  // Shared with the composer so the signature round-trips with the same
  // fidelity in both editors (#110).
  import {
    ExtendedTextStyle,
    ExtendedColor,
    ExtendedTable,
    ExtendedTableCell,
    ExtendedTableHeader,
    ExtendedLink,
    ComposerImage,
    PreserveStyles,
    FontFamily,
    StyledDiv,
    RawStyle,
    StylesheetLink,
  } from '$lib/components/composer/composerEditor'

  // Custom extension to make Enter insert <br> instead of new paragraph
  // Optimized with direct ProseMirror transaction for better performance
  const LineBreakOnEnter = Extension.create({
    name: 'lineBreakOnEnter',
    priority: 1000,
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          const { view } = this.editor
          const { state } = view
          const { schema, selection, storedMarks } = state

          const hardBreakType = schema.nodes.hardBreak
          if (!hardBreakType) return false

          const fromPos = selection.$from
          if (fromPos.parent.type.spec.isolating) return false

          const marks = storedMarks ||
            (selection.$to.parentOffset && selection.$from.marks()) ||
            []

          let tr = state.tr.replaceSelectionWith(hardBreakType.create(), false)

          if (marks.length > 0) {
            tr = tr.ensureMarks(marks)
          }

          tr.scrollIntoView()
          view.dispatch(tr)
          return true
        },
      }
    },
  })

  interface Props {
    /** HTML content of the signature */
    value?: string
    /** Placeholder text when empty */
    placeholder?: string
    /** Callback when content changes */
    onchange?: (html: string) => void
  }

  let { value = '', placeholder = 'Enter your signature...', onchange }: Props = $props()

  let editorElement: HTMLElement | undefined = $state()
  let editor = $state.raw<Editor | null>(null)
  let isUpdatingFromProp = false

  let isInTable = $state(false)
  let hasLink = $state(false)
  let rawHtmlMode = $state(false)
  let rawHtmlContent = $state('')

  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit.configure({
          // Disable heading for signatures - keep it simple
          heading: false,
        }),
        LineBreakOnEnter,  // Make Enter insert <br> instead of new paragraph
        Underline,
        ExtendedTextStyle,  // Required for Color extension (extended for better paste support)
        ExtendedColor,      // Text color support (extended for font tags and inline styles)
        FontSize,           // Font size support
        FontFamily,         // font-family / <font face> preservation
        PreserveStyles,     // inline style preservation on every node/mark
        StyledDiv,          // styled div containers
        RawStyle,           // embedded CSS blocks (web fonts)
        StylesheetLink,     // stylesheet links (web fonts)
        TextAlign.configure({
          types: ['paragraph'],  // Apply to paragraphs
        }),
        // Table support
        ExtendedTable.configure({
          resizable: false,
          HTMLAttributes: {
            class: 'border-collapse',
          },
        }),
        TableRow,
        ExtendedTableCell,
        ExtendedTableHeader,
        ExtendedLink.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
        }),
        ComposerImage.configure({
          inline: true,
          allowBase64: true,
          HTMLAttributes: {
            class: 'max-w-full h-auto',
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: 'signature-editor focus:outline-hidden min-h-[100px] p-3',
        },
        // Handle paste events for images
        handlePaste: (view, event) => {
          const items = event.clipboardData?.items
          if (!items) return false

          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) {
                handleImageFile(file)
              }
              return true
            }
          }
          // Allow HTML paste (for importing signatures)
          return false
        },
        // Handle drop events for images
        handleDrop: (view, event, slice, moved) => {
          if (moved) return false

          const files = event.dataTransfer?.files
          if (!files?.length) return false

          for (const file of files) {
            if (file.type.startsWith('image/')) {
              event.preventDefault()
              handleImageFile(file)
              return true
            }
          }
          return false
        },
      },
      onUpdate: () => {
        if (!isUpdatingFromProp) {
          onchange?.(editor?.getHTML() || '')
        }
      },
      onTransaction: ({ editor }) => {
        isInTable = editor.isActive('table')
        hasLink = editor.isActive('link')
      },
    })
  })

  onDestroy(() => {
    editor?.destroy()
  })

  // Update editor when value prop changes externally
  $effect(() => {
    if (editor && !rawHtmlMode && value !== editor.getHTML()) {
      isUpdatingFromProp = true
      editor.commands.setContent(value)
      isUpdatingFromProp = false
    }
  })

  // Handle image file (paste or drop)
  async function handleImageFile(file: File) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      editor?.chain().focus().setImage({ src: dataUrl }).run()
    } catch (err) {
      console.error('Failed to insert image:', err)
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  function removeLink() {
    editor?.chain().focus().unsetLink().run()
  }

  function insertImageUrl() {
    const url = prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  function insertImageFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        await handleImageFile(file)
      }
    }
    input.click()
  }

  // Table functions
  function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  function deleteTable() {
    editor?.chain().focus().deleteTable().run()
  }

  // Pretty-print HTML with indentation for readability in raw mode
  function formatHtml(html: string): string {
    const blockTags = /^(p|div|table|thead|tbody|tr|td|th|ul|ol|li|blockquote|hr|br)$/i

    // Insert newlines around block-level tags
    let result = html
      .replace(/>\s*</g, '>\n<')  // Newline between adjacent tags
      .trim()

    const lines = result.split('\n')
    const formatted: string[] = []
    let depth = 0

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue

      // Check if line starts with a closing block tag
      const closingMatch = line.match(/^<\/(\w+)/)
      if (closingMatch && blockTags.test(closingMatch[1])) {
        depth = Math.max(0, depth - 1)
      }

      formatted.push('  '.repeat(depth) + line)

      // Check for opening block tags (not self-closing)
      const openingMatch = line.match(/^<(\w+)/)
      if (openingMatch && blockTags.test(openingMatch[1]) && !line.match(/\/>$/) && !line.match(/^<br/i)) {
        // Only increase depth if the line doesn't also close the same tag
        const tagName = openingMatch[1]
        if (!line.includes(`</${tagName}>`)) {
          depth++
        }
      }
    }

    return formatted.join('\n')
  }

  // Raw HTML toggle
  function toggleRawHtml() {
    if (!rawHtmlMode) {
      // Switching to raw HTML mode - use value prop (preserves custom HTML attributes
      // that TipTap strips) rather than editor.getHTML() which normalizes away unknowns
      rawHtmlContent = formatHtml(value || '')
      rawHtmlMode = true
      return
    }
    // Switching back to WYSIWYG mode
    isUpdatingFromProp = true
    editor?.commands.setContent(rawHtmlContent)
    isUpdatingFromProp = false
    rawHtmlMode = false
    onchange?.(editor?.getHTML() || '')
  }

  function handleRawHtmlInput(event: Event) {
    rawHtmlContent = (event.target as HTMLTextAreaElement).value
    onchange?.(rawHtmlContent)
  }
</script>

<div class="overflow-hidden rounded-md border border-input bg-background">
  {#snippet toggleHtml()}
    {@const label = rawHtmlMode ? $_('editor.visualMode') : $_('editor.htmlMode')}
    <Button variant="ghost" size="icon-sm" class="ml-auto" onclick={toggleRawHtml} aria-pressed={rawHtmlMode} title={label} aria-label={label}>
      <Icon icon={rawHtmlMode ? 'mdi:eye' : 'mdi:code-tags'} aria-hidden="true" />
    </Button>
  {/snippet}

  {#if rawHtmlMode}
    <div class="flex border-b px-2 py-1">
      {@render toggleHtml()}
    </div>
    <Textarea
      class="min-h-25 resize-y rounded-none border-0 p-3 font-mono focus-visible:ring-inset focus-visible:ring-offset-0"
      value={rawHtmlContent}
      oninput={handleRawHtmlInput}
      aria-label={$_('editor.htmlMode')}
      spellcheck={false}
    />
  {:else}
    <EditorToolbar {editor} variant="signature" onInsertImage={insertImageFile}>
      {#if hasLink}
        <Button variant="ghost" size="icon-sm" class="text-destructive" onclick={removeLink} title={$_('editor.removeLink')} aria-label={$_('editor.removeLink')}>
          <Icon icon="mdi:link-off" aria-hidden="true" />
        </Button>
      {/if}
      <Button variant="ghost" size="icon-sm" onclick={insertImageUrl} title={$_('editor.insertImageUrl')} aria-label={$_('editor.insertImageUrl')}>
        <Icon icon="mdi:image-outline" aria-hidden="true" />
      </Button>
      <Separator orientation="vertical" class="mx-1 h-5 self-center" />
      <Button variant="ghost" size="icon-sm" onclick={insertTable} title={$_('editor.insertTable')} aria-label={$_('editor.insertTable')}>
        <Icon icon="mdi:table" aria-hidden="true" />
      </Button>
      {#if isInTable}
        <Button variant="ghost" size="icon-sm" class="text-destructive" onclick={deleteTable} title={$_('editor.deleteTable')} aria-label={$_('editor.deleteTable')}>
          <Icon icon="mdi:table-remove" aria-hidden="true" />
        </Button>
      {/if}
      {@render toggleHtml()}
    </EditorToolbar>
  {/if}

  <!-- Always mounted: the TipTap editor is created once and renders into this
       element, so it must only be hidden in raw mode, never unmounted (a
       re-mounted div would be empty while the editor still drew into the
       detached one). -->
  <div bind:this={editorElement} class="min-h-[100px]" class:hidden={rawHtmlMode}></div>
</div>

<style>
  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* Table styling */
  :global(.ProseMirror table) {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
  }

  :global(.ProseMirror td),
  :global(.ProseMirror th) {
    border: 1px solid hsl(var(--border));
    box-sizing: border-box;
    min-width: 1em;
    padding: 6px 8px;
    position: relative;
    vertical-align: top;
  }

  :global(.ProseMirror th) {
    background-color: hsl(var(--muted));
    font-weight: 600;
  }
</style>

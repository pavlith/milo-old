<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils'
  import Icon from '@iconify/svelte'
  import type { Editor } from '@tiptap/core'
  import { useEventListener } from 'runed'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Field, FieldGroup } from '$lib/components/ui/field'
  import { Separator } from '$lib/components/ui/separator'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Popover from '$lib/components/ui/popover'
  import { _ } from '$lib/i18n'

  interface Props {
    editor: Editor | null
    variant?: 'composer' | 'basic' | 'signature'
    disabled?: boolean
    children?: Snippet
    isPlainTextMode?: boolean
    onTogglePlainText?: () => void
    onInsertImage?: () => void
  }

  const {
    editor, variant = 'composer', disabled = false, children,
    isPlainTextMode = false, onTogglePlainText, onInsertImage,
  }: Props = $props()
  const allowFormatting = $derived(Boolean(editor) && !disabled && !isPlainTextMode)
  const isComposer = $derived(variant === 'composer')
  const linkInputId = $props.id()
  const tabIndex = $derived(isComposer ? -1 : undefined)

  // Hint mode state (Alt+T shows numbered hints on buttons)
  const formatLabel = $derived(isPlainTextMode ? $_('editor.switchToRichText') : $_('editor.switchToPlainText'))
  let hintMode = $state(false)
  let toolbarRef = $state<HTMLElement | null>(null)

  export function focus() {
    hintMode = !hintMode
  }

  useEventListener(() => hintMode ? window : null, 'keydown', (event) => {
    const key = event.key.toLowerCase()
    const button = /^[1-9a-f]$/.test(key)
      ? toolbarRef?.querySelector<HTMLButtonElement>(`[data-editor-hint="${key}"]:not(:disabled)`)
      : null
    if (key !== 'escape' && !button) return
    event.preventDefault()
    event.stopPropagation()
    hintMode = false
    button?.click()
  }, { capture: true })

  useEventListener(() => hintMode ? window : null, 'click', () => { hintMode = false })

  // Track active formatting states - only updated on transaction
  let activeStates = $state({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    link: false,
  })

  // Color and font size state
  let currentColor = $state<string | null>(null)
  let showColorPicker = $state(false)
  let currentFontSize = $state<string>('')
  let showFontSizePicker = $state(false)
  let currentAlign = $state<'left' | 'center' | 'right'>('left')

  // Preset colors
  const presetColors = [
    '#000000', '#374151', '#6b7280',
    '#dc2626', '#ea580c', '#ca8a04',
    '#16a34a', '#0891b2', '#2563eb',
    '#7c3aed', '#c026d3', '#e11d48',
  ]

  // Font sizes
  const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

  // Update active states from editor
  function updateActiveStates() {
    if (!editor) return

    activeStates = {
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      link: editor.isActive('link'),
    }

    // Get current color
    const textStyle = editor.getAttributes('textStyle')
    currentColor = textStyle.color || null
    currentFontSize = textStyle.fontSize || ''

    // Get current alignment
    if (editor.isActive({ textAlign: 'center' })) {
      currentAlign = 'center'
    } else if (editor.isActive({ textAlign: 'right' })) {
      currentAlign = 'right'
    } else {
      currentAlign = 'left'
    }
  }

  // Subscribe to editor transactions to update button states
  // This is more efficient than checking isActive() on every render
  $effect(() => {
    if (!editor) return

    // Initial state
    updateActiveStates()

    // Listen for selection/content changes
    const handleTransaction = () => {
      updateActiveStates()
    }

    editor.on('transaction', handleTransaction)

    return () => {
      editor.off('transaction', handleTransaction)
    }
  })

  // Toolbar actions
  function toggleBold() {
    editor?.chain().focus().toggleBold().run()
  }

  function toggleItalic() {
    editor?.chain().focus().toggleItalic().run()
  }

  function toggleUnderline() {
    editor?.chain().focus().toggleUnderline().run()
  }

  function toggleStrike() {
    editor?.chain().focus().toggleStrike().run()
  }

  function toggleBulletList() {
    editor?.chain().focus().toggleBulletList().run()
  }

  function toggleOrderedList() {
    editor?.chain().focus().toggleOrderedList().run()
  }

  function toggleBlockquote() {
    editor?.chain().focus().toggleBlockquote().run()
  }

  let showLinkDialog = $state(false)
  let linkUrl = $state('')

  function openLinkDialog() {
    if (variant === 'basic' && activeStates.link) {
      editor?.chain().focus().unsetLink().run()
      return
    }
    linkUrl = ''
    showLinkDialog = true
  }

  function insertLink(event: SubmitEvent) {
    event.preventDefault()
    const url = linkUrl.trim()
    if (!url) return
    editor?.chain().setLink({ href: url }).run()
    showLinkDialog = false
  }

  // Color functions
  function setColor(color: string) {
    editor?.chain().focus().setColor(color).run()
    showColorPicker = false
  }

  function removeColor() {
    editor?.chain().focus().unsetColor().run()
    showColorPicker = false
  }

  function handleCustomColor(event: Event) {
    const input = event.target as HTMLInputElement
    setColor(input.value)
  }

  // Font size functions
  function setFontSize(size: string) {
    editor?.chain().focus().setFontSize(size).run()
    showFontSizePicker = false
  }

  // Alignment functions
  function setAlign(align: 'left' | 'center' | 'right') {
    editor?.chain().focus().setTextAlign(align).run()
  }

  function keepFocusInEditor(event: Event) {
    if (editor?.isFocused) event.preventDefault()
  }
</script>

<div
  bind:this={toolbarRef}
  class={cn('relative flex shrink-0 flex-wrap items-center gap-0.5 border-b py-1',
    isComposer ? 'px-3' : 'px-2')}
  role="toolbar"
  aria-label={$_(variant === 'signature' ? 'aria.signatureEditor' : 'aria.textFormatting')}
>
  {#if hintMode}
    <div class="pointer-events-none absolute inset-0 z-10 bg-background/35"></div>
  {/if}

  {#snippet hint(key: string)}
    {#if hintMode && (!isPlainTextMode || key === 'f')}
      <span class="pointer-events-none absolute -top-0.5 left-0 z-20 grid size-4 place-content-center rounded-sm bg-primary text-[10px] font-bold text-primary-foreground" aria-hidden="true">{key}</span>
    {/if}
  {/snippet}

  {#snippet action(key: string, icon: string, label: string, onclick: (() => void) | undefined, pressed?: boolean)}
    <div class="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        data-editor-hint={key}
        aria-pressed={pressed}
        disabled={!allowFormatting}
        tabindex={tabIndex}
        title={label}
        aria-label={label}
        {onclick}
      >
        <Icon {icon} aria-hidden="true" />
      </Button>
      {@render hint(key)}
    </div>
  {/snippet}

  {@render action('1', 'mdi:format-bold', $_('editor.bold'), toggleBold, activeStates.bold)}
  {@render action('2', 'mdi:format-italic', $_('editor.italic'), toggleItalic, activeStates.italic)}
  {@render action('3', 'mdi:format-underline', $_('editor.underline'), toggleUnderline, activeStates.underline)}
  {#if variant !== 'basic'}
    {@render action('4', 'mdi:format-strikethrough', $_('editor.strikethrough'), toggleStrike, activeStates.strike)}

    <Separator orientation="vertical" class="mx-1 h-5 self-center" />

    <div class="relative">
      <Popover.Root bind:open={showColorPicker}>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="icon-sm"
              class="relative"
              data-editor-hint="5"
              tabindex={tabIndex}
              disabled={!allowFormatting}
              title={$_('editor.textColor')}
              aria-label={$_('editor.textColor')}
            >
              <Icon icon="mdi:format-color-text" aria-hidden="true" />
              <span class="absolute bottom-1 h-0.5 w-4 rounded-sm" style:background-color={currentColor || 'currentColor'}></span>
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content align="start" class="w-auto p-2" aria-label={$_('editor.textColor')} onCloseAutoFocus={keepFocusInEditor}>
          <div class="grid grid-cols-4 gap-1">
            {#each presetColors as color (color)}
              <Button
                variant="outline"
                size="icon-sm"
                style={`background-color: ${color}`}
                onclick={() => setColor(color)}
                title={color}
                aria-label={color}
                aria-pressed={currentColor === color}
              />
            {/each}
          </div>
          <Separator class="my-2" />
          <div class="flex items-center gap-2">
            <Input
              type="color"
              value={currentColor || '#000000'}
              onchange={handleCustomColor}
              class="size-8 p-1"
              title={$_('editor.customColor')}
              aria-label={$_('editor.customColor')}
            />
            <Button variant="ghost" size="sm" class="h-8" onclick={removeColor}>{$_('editor.reset')}</Button>
          </div>
        </Popover.Content>
      </Popover.Root>
      {@render hint('5')}
    </div>

    <div class="relative">
      <Popover.Root bind:open={showFontSizePicker}>
        <Popover.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="sm"
              class="h-8 px-2"
              data-editor-hint="6"
              tabindex={tabIndex}
              disabled={!allowFormatting}
              title={$_('editor.fontSize')}
              aria-label={$_('editor.fontSize')}
            >
              {currentFontSize || '14px'}
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content align="start" class="w-auto p-1" aria-label={$_('editor.fontSize')} onCloseAutoFocus={keepFocusInEditor}>
          <div class="grid grid-cols-3">
            {#each fontSizes as size (size)}
              <Button variant="ghost" size="sm" class="h-8 px-2" aria-pressed={currentFontSize === size} onclick={() => setFontSize(size)}>
                {size}
              </Button>
            {/each}
          </div>
        </Popover.Content>
      </Popover.Root>
      {@render hint('6')}
    </div>

    <Separator orientation="vertical" class="mx-1 h-5 self-center" />
    {@render action('7', 'mdi:format-align-left', $_('editor.alignLeft'), () => setAlign('left'), currentAlign === 'left')}
    {@render action('8', 'mdi:format-align-center', $_('editor.alignCenter'), () => setAlign('center'), currentAlign === 'center')}
    {@render action('9', 'mdi:format-align-right', $_('editor.alignRight'), () => setAlign('right'), currentAlign === 'right')}
  {/if}

  <Separator orientation="vertical" class="mx-1 h-5 self-center" />
  {#if variant !== 'signature'}
    {@render action('a', 'mdi:format-list-bulleted', $_('editor.bulletList'), toggleBulletList, activeStates.bulletList)}
    {@render action('b', 'mdi:format-list-numbered', $_('editor.numberedList'), toggleOrderedList, activeStates.orderedList)}
  {/if}
  {#if isComposer}
    {@render action('c', 'mdi:format-quote-close', $_('editor.quote'), toggleBlockquote, activeStates.blockquote)}
  {/if}
  {@render action('d', 'mdi:link', $_(variant === 'basic' && activeStates.link ? 'editor.removeLink' : 'editor.insertLink'), openLinkDialog, activeStates.link)}
  {#if onInsertImage}
    {@render action('e', isComposer ? 'mdi:image' : 'mdi:image-plus', $_(isComposer ? 'editor.insertImage' : 'editor.insertImageFile'), onInsertImage)}
  {/if}

  {@render children?.()}

  {#if onTogglePlainText}
    <div class="relative ml-auto">
      <Button
        variant="ghost"
        size="sm"
        class="h-8 gap-1.5 px-2"
        data-editor-hint="f"
        aria-pressed={isPlainTextMode}
        tabindex={tabIndex}
        title={formatLabel}
        aria-label={formatLabel}
        onclick={onTogglePlainText}
      >
        <Icon icon={isPlainTextMode ? 'mdi:format-text' : 'mdi:text'} class="size-4" aria-hidden="true" data-icon="inline-start" />
        <span class="hidden sm:inline">{isPlainTextMode ? $_('editor.richText') : $_('editor.plainText')}</span>
      </Button>
      {@render hint('f')}
    </div>
  {/if}
</div>

<Dialog.Root bind:open={showLinkDialog}>
  <Dialog.Content
    aria-describedby={undefined}
    onCloseAutoFocus={(event) => { event.preventDefault(); editor?.commands.focus() }}
  >
    <Dialog.Header>
      <Dialog.Title>{$_('editor.insertLink')}</Dialog.Title>
    </Dialog.Header>
    <form class="flex flex-col gap-4" onsubmit={insertLink}>
      <FieldGroup>
        <Field>
          <Label for={linkInputId}>{$_('editor.linkUrl')}</Label>
          <Input id={linkInputId} data-editor-link-url type="text" inputmode="url" bind:value={linkUrl} required />
        </Field>
      </FieldGroup>
      <Dialog.Footer>
        <Button variant="ghost" onclick={() => showLinkDialog = false}>{$_('common.cancel')}</Button>
        <Button type="submit" disabled={!linkUrl.trim()}>{$_('common.add')}</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

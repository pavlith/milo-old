<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as Select from '$lib/components/ui/select'
  import { Field, FieldGroup } from '$lib/components/ui/field'
  import { Separator } from '$lib/components/ui/separator'
  import { Label } from '$lib/components/ui/label'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import AccountAddressDefaults from './AccountAddressDefaults.svelte'
  import { _ } from '$lib/i18n'
  import { SPELLCHECK_DICTS, DICT_NAMES } from '$lib/spellcheck/locales'
  import { getSpellcheckCustomWords } from '$lib/stores/settings.svelte'
  import { removeCustomWord } from '$lib/spellcheck/settings'
  import SpellWordList from '$lib/spellcheck/SpellWordList.svelte'

  interface Props {
    composerMode: string
    mailtoMode: string
    composerFormat: string
    readReceiptResponsePolicy: string
    spellcheckEnabled: boolean
    spellcheckLanguages: string[]
    onComposerModeChange: (value: string) => void
    onMailtoModeChange: (value: string) => void
    onFormatChange: (value: string) => void
    onPolicyChange: (value: string) => void
    onSpellcheckEnabledChange: (value: boolean) => void
    onSpellcheckLanguagesChange: (value: string[]) => void
  }

  let {
    composerMode = $bindable(),
    mailtoMode = $bindable(),
    composerFormat = $bindable(),
    readReceiptResponsePolicy = $bindable(),
    spellcheckEnabled = $bindable(),
    spellcheckLanguages = $bindable(),
    onComposerModeChange,
    onMailtoModeChange,
    onFormatChange,
    onPolicyChange,
    onSpellcheckEnabledChange,
    onSpellcheckLanguagesChange,
  }: Props = $props()

  // Dictionaries Aerion ships, with their native display names.
  const dictLanguages = SPELLCHECK_DICTS.map((code) => ({
    code,
    name: DICT_NAMES[code],
  }))

  // Added-words list — read straight from the store (persists immediately on
  // add/remove, independent of the dialog's Save flow).
  const addedWords = $derived(getSpellcheckCustomWords())

  const modeOptions = $derived([
    { value: 'inline', label: $_('settings.composerModeInline') },
    { value: 'detached', label: $_('settings.composerModeDetached') },
  ])

  const formatOptions = $derived([
    { value: 'rich', label: $_('settings.composerFormatRich') },
    { value: 'plain', label: $_('settings.composerFormatPlain') },
  ])

  const readReceiptResponseOptions = $derived([
    { value: 'never', label: $_('settingsGeneral.neverSendReceipts') },
    { value: 'ask', label: $_('settingsGeneral.askEachTime') },
    { value: 'always', label: $_('settingsGeneral.alwaysSendReceipts') },
  ])

  function getModeLabel(mode: string): string {
    return modeOptions.find(o => o.value === mode)?.label ?? mode
  }

  function getPolicyLabel(value: string): string {
    return readReceiptResponseOptions.find(o => o.value === value)?.label ?? value
  }

  function handleComposerModeChange(value: string | undefined) {
    if (!value) return
    composerMode = value
    onComposerModeChange?.(value)
  }

  function handleMailtoModeChange(value: string | undefined) {
    if (!value) return
    mailtoMode = value
    onMailtoModeChange?.(value)
  }

  function getFormatLabel(value: string): string {
    return formatOptions.find(o => o.value === value)?.label ?? value
  }

  function handleFormatChange(value: string | undefined) {
    if (!value) return
    composerFormat = value
    onFormatChange?.(value)
  }

  function handlePolicyChange(value: string | undefined) {
    if (!value) return
    readReceiptResponsePolicy = value
    onPolicyChange?.(value)
  }

  function handleSpellcheckEnabledChange(value: boolean) {
    spellcheckEnabled = value
    onSpellcheckEnabledChange?.(value)
  }

  function handleLangToggle(code: string, on: boolean) {
    const next = on
      ? [...spellcheckLanguages, code]
      : spellcheckLanguages.filter((c) => c !== code)
    spellcheckLanguages = next
    onSpellcheckLanguagesChange?.(next)
  }

</script>

<FieldGroup class="gap-5 p-1">
  <Field>
    <Label for="composer-open-mode">{$_('settings.composerMode')}</Label>
    <Select.Root value={composerMode} onValueChange={handleComposerModeChange}>
      <Select.Trigger id="composer-open-mode" aria-describedby="composer-open-mode-help">
        <Select.Value placeholder={$_('settings.composerMode')}>
          {getModeLabel(composerMode)}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each modeOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
    <p id="composer-open-mode-help" class="text-xs text-muted-foreground">
      {$_('settings.composerModeDescription')}
    </p>
  </Field>

  <Field>
    <Label for="composer-mailto-mode">{$_('settings.mailtoMode')}</Label>
    <Select.Root value={mailtoMode} onValueChange={handleMailtoModeChange}>
      <Select.Trigger id="composer-mailto-mode" aria-describedby="composer-mailto-mode-help">
        <Select.Value placeholder={$_('settings.mailtoMode')}>
          {getModeLabel(mailtoMode)}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each modeOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
    <p id="composer-mailto-mode-help" class="text-xs text-muted-foreground">
      {$_('settings.mailtoModeDescription')}
    </p>
  </Field>

  <Field>
    <Label for="composer-format">{$_('settings.composerFormat')}</Label>
    <Select.Root value={composerFormat} onValueChange={handleFormatChange}>
      <Select.Trigger id="composer-format" aria-describedby="composer-format-help">
        <Select.Value placeholder={$_('settings.composerFormat')}>
          {getFormatLabel(composerFormat)}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each formatOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
    <p id="composer-format-help" class="text-xs text-muted-foreground">
      {$_('settings.composerFormatDescription')}
    </p>
  </Field>

  <Separator />

  <!-- Read Receipts Section -->
  <div class="flex flex-col gap-3">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="mdi:email-check-outline" class="w-4 h-4" />
      {$_('settingsGeneral.readReceipts')}
    </h3>

    <Field>
      <Label for="read-receipt-policy">{$_('settingsGeneral.readReceiptPolicy')}</Label>
      <Select.Root value={readReceiptResponsePolicy} onValueChange={handlePolicyChange}>
        <Select.Trigger id="read-receipt-policy" aria-describedby="read-receipt-policy-help">
          <Select.Value placeholder={$_('settingsGeneral.selectPolicy')}>
            {getPolicyLabel(readReceiptResponsePolicy)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each readReceiptResponseOptions as opt (opt.value)}
              <Select.Item value={opt.value} label={opt.label} />
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <p id="read-receipt-policy-help" class="text-xs text-muted-foreground">
        {$_('settingsGeneral.readReceiptPolicyHelp')}
      </p>
    </Field>
  </div>

  <Separator />

  <!-- Spellcheck Section -->
  <div class="flex flex-col gap-3">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="mdi:spellcheck" class="w-4 h-4" />
      {$_('spellcheck.title')}
    </h3>

    <Field orientation="horizontal" class="justify-between gap-3">
      <div>
        <Label for="spellcheck-enabled">{$_('spellcheck.enable')}</Label>
        <p id="spellcheck-enabled-help" class="text-xs text-muted-foreground">{$_('spellcheck.enableHelp')}</p>
      </div>
      <Switch id="spellcheck-enabled" aria-describedby="spellcheck-enabled-help" checked={spellcheckEnabled} onCheckedChange={handleSpellcheckEnabledChange} />
    </Field>

    <fieldset class="flex min-w-0 flex-col gap-2 disabled:opacity-50" disabled={!spellcheckEnabled} aria-describedby="spellcheck-languages-help">
      <legend class="mb-2 text-sm font-medium">{$_('spellcheck.languages')}</legend>
      <div class="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
        {#each dictLanguages as lang (lang.code)}
          <div class="flex items-center justify-between px-1 py-1">
            <Label for={`spellcheck-lang-${lang.code}`} class="font-normal">{lang.name}</Label>
            <Switch
              id={`spellcheck-lang-${lang.code}`}
              disabled={!spellcheckEnabled}
              checked={spellcheckLanguages.includes(lang.code)}
              onCheckedChange={(v) => handleLangToggle(lang.code, v)}
            />
          </div>
        {/each}
      </div>
      <p id="spellcheck-languages-help" class="text-xs text-muted-foreground">{$_('spellcheck.languagesHelp')}</p>
    </fieldset>

    <SpellWordList
      title={$_('spellcheck.addedWords')}
      words={addedWords}
      emptyText={$_('spellcheck.noAddedWords')}
      removeLabel={$_('spellcheck.removeWord')}
      onRemove={removeCustomWord}
    />
  </div>

  <Separator />

  <!-- Per-account default Reply-To -->
  <AccountAddressDefaults
    kind="replyto"
    title={$_('settings.defaultReplyTo')}
    icon="mdi:reply"
    help={$_('settings.defaultReplyToHelp')}
    placeholder="replies@example.com"
    single
  />

  <Separator />

  <!-- Per-account default CC -->
  <AccountAddressDefaults
    kind="cc"
    title={$_('settings.defaultCc')}
    icon="mdi:email-multiple-outline"
    help={$_('settings.defaultCcHelp')}
    placeholder="boss@example.com"
  />

  <Separator />

  <!-- Per-account default BCC (#341) -->
  <AccountAddressDefaults
    kind="bcc"
    title={$_('settings.defaultBcc')}
    icon="mdi:email-plus-outline"
    help={$_('settings.defaultBccHelp')}
    placeholder="crm@example.com"
  />
</FieldGroup>

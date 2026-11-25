<script lang="ts">
  import * as Form from 'formsnap'
  import { Input } from '$lib/components/ui/input'
  import { Field } from '$lib/components/ui/field'
  import type { Snippet } from 'svelte'
  import type { AccountFormAdapter } from './accountFormAdapter.svelte'

  interface Props {
    form: AccountFormAdapter
    name: 'name' | 'displayName' | 'email' | 'imapHost' | 'smtpHost'
    id?: string
    label: string
    description?: string
    placeholder?: string
    value: string
    disabled?: boolean
    onValueChange?: (value: string) => void
    leading?: Snippet
  }

  let {
    form, name, id, label, description, placeholder, value = $bindable(), disabled = false, onValueChange, leading,
  }: Props = $props()
</script>

<Form.Field {form} {name}>
  {#snippet children({ errors })}
    <Field data-invalid={errors.length > 0 || undefined} data-disabled={disabled || undefined} class="gap-2">
      <Form.Control {id}>
        {#snippet children({ props })}
          <Form.Label class="text-sm font-medium">{label}</Form.Label>
          <div class="flex items-center gap-3">
            {@render leading?.()}
            <Input
              {...props}
              type={name === 'email' ? 'email' : 'text'}
              {placeholder}
              {disabled}
              bind:value
              oninput={(event) => onValueChange?.(event.currentTarget.value)}
            />
          </div>
        {/snippet}
      </Form.Control>
      {#if description}
        <Form.Description class="text-xs text-muted-foreground">{description}</Form.Description>
      {/if}
      <Form.FieldErrors class="text-sm text-destructive" />
    </Field>
  {/snippet}
</Form.Field>

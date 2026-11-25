import type { SuperForm } from 'sveltekit-superforms'
import { readable, toStore } from 'svelte/store'

type AccountFields = {
  name: string
  displayName: string
  email: string
  imapHost: string
  smtpHost: string
}

export type AccountFormAdapter = SuperForm<AccountFields>

export function createAccountFormAdapter(
  fields: () => AccountFields,
  errors: () => Record<string, string>,
  { editing = false, noOutgoingServer = () => false }: { editing?: boolean; noOutgoingServer?: () => boolean } = {},
): AccountFormAdapter {
  return {
    form: toStore(fields),
    errors: toStore(() => {
      const result: Partial<Record<keyof AccountFields, string[]>> = {}
      const messages = errors()
      for (const name of ['name', 'displayName', 'email', 'imapHost', 'smtpHost'] as const) {
        if (messages[name]) result[name] = [messages[name]]
      }
      return result
    }),
    constraints: toStore(() => ({
      name: { required: true },
      displayName: { required: true },
      email: { required: !editing },
      imapHost: { required: true },
      smtpHost: { required: !noOutgoingServer() },
    })),
    tainted: readable(undefined),
  }
}

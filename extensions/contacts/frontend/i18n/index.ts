import { register } from 'svelte-i18n'

// Discovered by core's initI18n. Messages merge under the extension namespace.
export function registerExtensionI18n(): void {
  register('en', () => import('./locales/en.json'))
  register('ru', () => import('./locales/ru.json'))
}

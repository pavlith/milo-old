import { register, init, waitLocale, locale, _ } from 'svelte-i18n'

register('en', () => import('./locales/en.json'))
register('ru', () => import('./locales/ru.json'))

// Register extension loaders before init so their namespaces merge with core.
const extensionI18nModules = import.meta.glob<{
  registerExtensionI18n: () => void
}>('../../../../extensions/*/frontend/i18n/index.ts', { eager: true })

export const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
] as const

type UILocale = typeof supportedLocales[number]['code']

export function isSupportedLocale(code: string): code is UILocale {
  return supportedLocales.some(locale => locale.code === code)
}

export async function initI18n(savedLocale = ''): Promise<void> {
  const systemLanguage = navigator.language.toLowerCase().split('-')[0]
  const initialLocale = savedLocale || (systemLanguage === 'ru' ? 'ru' : 'en')

  for (const mod of Object.values(extensionI18nModules)) {
    mod.registerExtensionI18n?.()
  }

  await init({
    fallbackLocale: 'en',
    initialLocale: isSupportedLocale(initialLocale) ? initialLocale : 'en',
  })
}

let localeChange = 0

export async function setLocale(code: UILocale): Promise<void> {
  const change = ++localeChange
  await waitLocale(code)
  // The latest request wins even if an earlier catalog took longer to load.
  if (change === localeChange) await locale.set(code)
}

export { _, locale }

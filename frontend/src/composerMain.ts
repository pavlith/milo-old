import { initializeTheme, COMPOSER_MODE_STORAGE_KEY } from '$lib/stores/theme.svelte'
import { initI18n, isSupportedLocale, setLocale } from './lib/i18n'
import ComposerApp from './ComposerApp.svelte'
import { mount } from 'svelte'
import { GetLanguage } from '$bindings/github.com/pavlith/milo/app/app'
import { EventsOn } from '$lib/desktop'

async function bootstrap() {
  initializeTheme(COMPOSER_MODE_STORAGE_KEY)
  // A change may arrive while the settings read or initial catalog is in flight.
  let pendingLocale = ''
  let initialized = false
  EventsOn('language:changed', (code: string) => {
    if (!isSupportedLocale(code)) return
    if (initialized) {
      void setLocale(code).catch(err => console.error('Failed to switch language:', err))
    } else {
      pendingLocale = code
    }
  })

  const savedLocale = await GetLanguage().catch(err => {
    console.error('Failed to load language:', err)
    return ''
  })
  let initialLocale = pendingLocale || savedLocale
  await initI18n(initialLocale)
  while (isSupportedLocale(pendingLocale) && pendingLocale !== initialLocale) {
    initialLocale = pendingLocale
    await setLocale(pendingLocale)
  }

  initialized = true
  mount(ComposerApp, { target: document.getElementById('app')! })
}

bootstrap()

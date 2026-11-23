import './app.css'
import { initI18n, isSupportedLocale, setLocale } from './lib/i18n'
import { waitForRuntime } from './lib/waitForRuntime'
import ComposerApp from './ComposerApp.svelte'
import { mount } from 'svelte'
import { GetLanguage } from '../wailsjs/go/app/ComposerApp'
import { EventsOn } from '../wailsjs/runtime/runtime'

async function bootstrap() {
  await waitForRuntime()

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

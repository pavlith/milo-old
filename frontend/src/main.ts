import './app.css'
import { initI18n } from './lib/i18n'
import App from './App.svelte'
import { mount } from 'svelte'
import { setThemeMode } from '$lib/stores/settings.svelte'
import { GetLanguage, GetThemeMode, WaitForReady, RestoreWindowPosition } from '$bindings/github.com/hkdb/aerion/app/app'
import { WindowShow } from '$lib/desktop'

// The HTML splash stays visible until the backend and saved appearance are ready.
async function bootstrap(): Promise<void> {
  await WindowShow()
  await WaitForReady()
  await Promise.all([
    GetLanguage().catch(err => {
      console.error('Failed to load language:', err)
      return ''
    }).then(initI18n),
    GetThemeMode().then(setThemeMode).catch(err => {
      console.error('Failed to load theme mode:', err)
    }),
  ])
  void RestoreWindowPosition().catch(err => console.warn('Could not restore window position:', err))
  mount(App, { target: document.getElementById('app')! })
}

bootstrap().catch(err => console.error('Failed to start mail window:', err))

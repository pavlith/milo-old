import './app.css'
import { initI18n } from './lib/i18n'
import { waitForRuntime } from './lib/waitForRuntime'
import App from './App.svelte'
import { mount } from 'svelte'
import { setThemeMode } from '$lib/stores/settings.svelte'
// @ts-ignore - wailsjs path
import { GetLanguage, GetThemeMode, IsReady } from '../wailsjs/go/app/App'
// @ts-ignore - wailsjs path
import { EventsOn, WindowShow } from '../wailsjs/runtime/runtime'

// The HTML splash stays visible until the backend and saved appearance are ready.
async function bootstrap(): Promise<void> {
  await waitForRuntime()
  WindowShow()
  await waitForBackendReady()
  await Promise.all([
    GetLanguage().catch(err => {
      console.error('Failed to load language:', err)
      return ''
    }).then(initI18n),
    GetThemeMode().then(setThemeMode).catch(err => {
      console.error('Failed to load theme mode:', err)
    }),
  ])
  mount(App, { target: document.getElementById('app')! })
}

// waitForBackendReady resolves when the Go-side Startup hook has reached the
// point where the frontend can safely mount: stores constructed, migrations
// applied, extensions registered, background sync started. (The D-Bus
// desktop-integration inits that run later in Startup can hang for many
// seconds on systems where xdg-desktop-portal isn't running — we
// deliberately do NOT wait for those.)
//
// App.svelte's onMount fires Wails method calls that touch stores
// (settingsStore, accountStore, etc.); if those calls land before stores
// exist, the methods hit nil pointers and crash — on Linux/webkit2gtk the
// crash manifests as the "non-Go code set up signal handler without
// SA_ONSTACK flag" runtime panic.
//
// Event-driven: Go emits "app:ready" once stores are ready. We register a
// single EventsOn listener and call IsReady() once as a safety net for the
// race where Go emits before this code runs (Startup finishes faster than
// the bundle parses). No polling — the Wails IPC bridge saturates under
// repeated calls on Linux/webkit2gtk (especially Flatpak).
//
// Precondition: waitForRuntime() has resolved, so window.runtime is present
// and EventsOn + IsReady are safe to call directly.
function waitForBackendReady(): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false
    const fire = () => {
      if (done) return
      done = true
      resolve()
    }

    EventsOn('app:ready', fire)

    // One-shot fallback for the race where Go already emitted before we
    // registered. Single IPC call; .catch swallows any binding error so
    // the event path still has a chance.
    IsReady()
      .then((ready: boolean) => {
        if (ready) fire()
      })
      .catch(() => {
        /* event path will resolve us */
      })
  })
}

bootstrap()

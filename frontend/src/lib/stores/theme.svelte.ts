import { flushSync } from 'svelte'
import { mode, modeStorageKey, setMode, systemPrefersMode } from 'mode-watcher'

export type ThemeMode = 'light' | 'dark' | 'system'

export const DEFAULT_THEME_MODE: ThemeMode = 'system'
export const MAIL_MODE_STORAGE_KEY = 'milo-mail-mode'
export const COMPOSER_MODE_STORAGE_KEY = 'milo-composer-mode'

export function normalizeThemeMode(value: unknown): ThemeMode {
  switch (value) {
    case 'light':
    case 'dark':
    case 'system':
      return value
    case 'nord-dark':
    case 'dracula':
      return 'dark'
    default:
      return DEFAULT_THEME_MODE
  }
}

export function getIsDarkActive(): boolean {
  return mode.current === 'dark'
}

export function initializeTheme(storageKey: string) {
  // Separate WebView caches keep the mail window's preview local. The Go
  // settings store is authoritative and broadcasts changes after Save.
  modeStorageKey.current = storageKey
  flushSync()
  systemPrefersMode.query()
  applyTheme(DEFAULT_THEME_MODE)
  document.documentElement.classList.toggle('dark', getIsDarkActive())
}

export function applyTheme(value: unknown) {
  setMode(normalizeThemeMode(value))
  void mode.current
}

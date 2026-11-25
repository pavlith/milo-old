import { mode, setMode, systemPrefersMode } from 'mode-watcher'

// Shared by the main window and detached composer.
export type ThemeMode = 'nord-dark' | 'dracula'

export const DEFAULT_THEME_MODE: ThemeMode = 'nord-dark'

let activeTheme = $state<ThemeMode>(DEFAULT_THEME_MODE)

export function normalizeThemeMode(mode: unknown): ThemeMode {
  return mode === 'dracula' ? mode : DEFAULT_THEME_MODE
}

export function getActiveTheme(): ThemeMode {
  return activeTheme
}

export function getIsDarkActive(): boolean {
  return mode.current === 'dark'
}

export function initializeDarkMode() {
  systemPrefersMode.tracking(false)
  setMode('dark')
  // Apply Mode Watcher's color scheme before mounting either window.
  void mode.current
}

export function applyTheme(mode: unknown) {
  const theme = normalizeThemeMode(mode)
  const root = document.documentElement
  root.dataset.theme = theme
  activeTheme = theme
}

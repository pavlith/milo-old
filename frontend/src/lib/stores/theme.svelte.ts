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

// Kept for mail and extension consumers that distinguish dark surfaces.
export function getIsDarkActive(): boolean {
  return true
}

export function applyTheme(mode: unknown) {
  const theme = normalizeThemeMode(mode)
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.add('dark')
  activeTheme = theme
}

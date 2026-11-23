package app

import "github.com/hkdb/aerion/internal/platform"

// GetSystemTheme reports the OS preference for Wails API compatibility.
func (a *App) GetSystemTheme() string {
	return platform.ReadSystemTheme()
}

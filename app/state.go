package app

import (
	"strings"

	"github.com/pavlith/milo/internal/appstate"
)

// ============================================================================
// UI State Persistence
// ============================================================================

// GetUIState retrieves the last saved UI state
func (a *App) GetUIState() (*appstate.UIState, error) {
	return a.appStateStore.GetUIState()
}

// SaveUIState persists the current UI state
func (a *App) SaveUIState(state *appstate.UIState) error {
	return a.appStateStore.SaveUIState(state)
}

// ============================================================================
// App Info API - Exposed to frontend via Wails bindings
// ============================================================================

// Version is the Milo release version. Bump on each release; consumed by
// the About dialog via GetAppInfo() and by the --version CLI flag in main.go.
// Keep it aligned with build/config.yml and the frontend npm manifests.
const Version = "0.0.1"

// AppInfo contains application metadata
type AppInfo struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Website     string `json:"website"`
	License     string `json:"license"`
}

// GetAppInfo returns application metadata for the About dialog
func (a *App) GetAppInfo() AppInfo {
	return AppInfo{
		Name:        "Milo",
		Version:     Version,
		Description: "A lightweight, Linux-first email client",
		Website:     "https://github.com/pavlith/milo",
		License:     "Apache 2.0",
	}
}

// GetPendingMailto returns and clears any pending mailto: URL data.
// The main frontend calls this after its activation listeners are ready.
func (a *App) GetPendingMailto() *MailtoData {
	data := a.PendingMailto
	a.PendingMailto = nil
	if a.SingleInstanceLock != nil {
		a.SingleInstanceLock.SetOnShow(func(command string) {
			if strings.HasPrefix(command, "mailto:") {
				a.handleExternalMailto(command)
				return
			}
			a.ShowWindow()
		})
	}
	return data
}

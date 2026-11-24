package main

import (
	"os"

	"github.com/hkdb/aerion/app"
	"github.com/hkdb/aerion/internal/platform"
)

// runPreflight performs pre-Wails startup checks (paths, DB open, migrations,
// credential store). On failure it surfaces a native error dialog and exits
// before creating the Wails application. Wails v3 generates bindings by
// inspecting Go packages without executing the application.
func runPreflight(application *app.App) {
	err := application.Preflight()
	if err == nil {
		return
	}
	info := app.StartupDialogInfoFor(err)
	if info.ActionURL != "" {
		platform.ShowDialogWithLink(platform.DialogIconError, info.Title, info.Text, info.ActionLabel, info.ActionURL)
		os.Exit(1)
	}
	platform.ShowDialog(platform.DialogIconError, info.Title, info.Text)
	os.Exit(1)
}

package app

import (
	"github.com/pavlith/milo/internal/appstate"
	"github.com/pavlith/milo/internal/logging"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// AttachMainWindow connects the native mail window to the shared service.
func AttachMainWindow(a *App, window *application.WebviewWindow) {
	a.mainWindow = window
	window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		if !a.shuttingDown.Load() {
			event.Cancel()
			go a.CloseWindow()
		}
	})
}

func (a *App) saveWindowGeometry() {
	if a.appStateStore == nil {
		return
	}
	var geo appstate.WindowGeometry
	if a.mainWindow.IsMaximised() {
		geo, _ = a.appStateStore.GetWindowGeometry()
		geo.Maximized = true
	} else {
		geo.Width, geo.Height = a.mainWindow.Size()
		geo.X, geo.Y = a.mainWindow.Position()
		if geo.Width <= 0 || geo.Height <= 0 {
			return
		}
	}
	if err := a.appStateStore.SetWindowGeometry(geo); err != nil {
		log := logging.WithComponent("app")
		log.Warn().Err(err).Msg("Failed to save window geometry")
	}
}

// RestoreWindowPosition restores the last visible position where the window manager supports it.
func (a *App) RestoreWindowPosition() {
	geo, ok := a.appStateStore.GetWindowGeometry()
	if !ok || geo.Maximized {
		return
	}
	for _, screen := range application.Get().Screen.GetAll() {
		bounds := screen.Bounds
		if geo.X >= bounds.X && geo.X < bounds.X+bounds.Width &&
			geo.Y >= bounds.Y && geo.Y < bounds.Y+bounds.Height {
			a.mainWindow.SetPosition(geo.X, geo.Y)
			return
		}
	}
}

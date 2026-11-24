package app

import (
	"context"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func emit(name string, data ...any) {
	if desktop := application.Get(); desktop != nil {
		desktop.Event.Emit(name, data...)
	}
}

func callerWindow(ctx context.Context) application.Window {
	window, _ := ctx.Value(application.WindowKey).(application.Window)
	return window
}

func openFile(ctx context.Context, opts application.OpenFileDialogOptions) (string, error) {
	opts.Window = callerWindow(ctx)
	return application.Get().Dialog.OpenFileWithOptions(&opts).PromptForSingleSelection()
}

func openFiles(ctx context.Context, opts application.OpenFileDialogOptions) ([]string, error) {
	opts.Window = callerWindow(ctx)
	return application.Get().Dialog.OpenFileWithOptions(&opts).PromptForMultipleSelection()
}

func openDirectory(ctx context.Context, opts application.OpenFileDialogOptions) (string, error) {
	opts.CanChooseDirectories = true
	return openFile(ctx, opts)
}

func saveFile(ctx context.Context, opts application.SaveFileDialogOptions) (string, error) {
	opts.Window = callerWindow(ctx)
	return application.Get().Dialog.SaveFileWithOptions(&opts).PromptForSingleSelection()
}

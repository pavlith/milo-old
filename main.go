package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log/slog"
	"os"
	"strings"

	"github.com/hkdb/aerion/app"
	"github.com/hkdb/aerion/internal/appstate"
	"github.com/hkdb/aerion/internal/logging"
	"github.com/hkdb/aerion/internal/platform"
	"github.com/hkdb/aerion/internal/settings"
	"github.com/rs/zerolog"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

// Command-line flags
var (
	debugMode   = flag.Bool("debug", false, "Enable debug logging (same as --log-level debug)")
	logLevel    = flag.String("log-level", "", "Log level: fatal, error, warn, info, debug (default fatal; env AERION_LOG_LEVEL)")
	logFile     = flag.String("log-file", "", "Also write logs to this file, 10 MB rollover to <file>.1 (env AERION_LOG_FILE)")
	dbusNotify  = flag.Bool("dbus-notify", false, "Use direct D-Bus notifications instead of portal (Linux only)")
	versionFlag = flag.Bool("version", false, "Show version and exit")
)

// DebugMode returns whether debug logging is enabled
// Can be enabled via --debug flag or AERION_DEBUG=1 environment variable
func DebugMode() bool {
	return *debugMode || os.Getenv("AERION_DEBUG") == "1"
}

// resolveLogConfig turns the logging flags/env vars into a logging.Config.
// Precedence: --debug / AERION_DEBUG=1 force debug; otherwise --log-level,
// then AERION_LOG_LEVEL, then fatal. File: --log-file, then AERION_LOG_FILE.
// An unknown level name is a usage error: fail fast rather than silently
// logging at the wrong level for a week-long capture.
func resolveLogConfig() logging.Config {
	level := *logLevel
	if level == "" {
		level = os.Getenv("AERION_LOG_LEVEL")
	}
	if level == "" {
		level = "fatal"
	}
	if DebugMode() {
		level = "debug"
	}
	if _, err := zerolog.ParseLevel(level); err != nil {
		fmt.Fprintf(os.Stderr, "aerion: invalid --log-level %q (want fatal, error, warn, info or debug)\n", level)
		os.Exit(2)
	}

	file := *logFile
	if file == "" {
		file = os.Getenv("AERION_LOG_FILE")
	}
	return logging.Config{Level: level, Console: true, File: file}
}

func main() {
	flag.Parse()

	if *versionFlag {
		fmt.Println(app.Version)
		return
	}

	// Initialize process-wide logging.
	logCfg := resolveLogConfig()

	// On Windows, GUI apps have no console. Allocate one whenever any
	// console logging was requested (anything below fatal).
	if logCfg.Level != "fatal" {
		platform.AttachConsole()
	}
	if err := logging.Init(logCfg); err != nil {
		// A bad --log-file must not block startup; stderr logging still works.
		fmt.Fprintf(os.Stderr, "aerion: logging init failed: %v\n", err)
	}

	// Check for mailto: URL in non-flag arguments
	var mailtoData *app.MailtoData
	var rawMailtoArg string
	args := flag.Args()
	for _, arg := range args {
		if strings.HasPrefix(strings.ToLower(arg), "mailto:") {
			mailtoData = app.ParseMailtoURL(arg)
			rawMailtoArg = arg
			break
		}
	}

	runMainMode(mailtoData, rawMailtoArg)
}

func runMainMode(mailtoData *app.MailtoData, rawMailtoArg string) {
	activate := rawMailtoArg
	if activate == "" {
		activate = "show"
	}
	lock := platform.NewSingleInstanceLock()
	locked, err := lock.TryLock(activate)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Single-instance check:", err)
	}
	if !locked {
		return
	}
	defer lock.Unlock()

	mail := app.NewApp(*dbusNotify)
	mail.SingleInstanceLock = lock
	mail.PendingMailto = mailtoData
	runPreflight(mail)

	opts := application.WebviewWindowOptions{
		Name: "mail", Title: "Aerion", URL: "/",
		Width: 1280, Height: 800, MinWidth: 360, MinHeight: 400,
		Frameless: true, Hidden: true,
		BackgroundColour: application.NewRGB(27, 38, 54),
	}
	if paths, err := platform.GetPaths(); err == nil {
		opts.Frameless = !settings.ReadNativeTitleBar(paths.DatabasePath())
		if geo, ok := appstate.ReadWindowGeometry(paths.DatabasePath()); ok {
			if geo.Width >= 360 && geo.Width <= 10000 && geo.Height >= 400 && geo.Height <= 10000 {
				opts.Width, opts.Height = geo.Width, geo.Height
			}
			if geo.Maximized {
				opts.StartState = application.WindowStateMaximised
			}
		}
	}

	frontend, err := fs.Sub(assets, "frontend/dist")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return
	}
	desktop := application.New(application.Options{
		Name:                        "Aerion",
		Linux:                       application.LinuxOptions{ApplicationID: "io.github.hkdb.Aerion"},
		DisableDefaultSignalHandler: true,
		Assets:                      application.AssetOptions{Handler: application.BundledAssetFileServer(frontend)},
		Services:                    []application.Service{application.NewService(mail)},
		// Wails logs Go build settings, including OAuth linker flags, at info level.
		LogLevel: slog.LevelWarn,
	})
	app.AttachMainWindow(mail, desktop.Window.NewWithOptions(opts))
	if err := desktop.Run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

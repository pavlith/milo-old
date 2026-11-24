# Wails 3 migration on Linux

Aerion uses Wails `v3.2.0-nightly.20261123` for the Go module, CLI and frontend runtime. The Linux application uses native GTK4 windows and WebKitGTK 6.0. See [Build on Linux](BUILD.md) for prerequisites and commands.

## Windows and Go bindings

- The main window loads `index.html`. Each detached composer loads `composer.html` in its own window and shares the main process's mail service. This removes the separate composer process and its authenticated IPC transport. The service uses the caller's window to look up composer state and parent file dialogs. Theme and language changes reach open windows through Wails events.
- Single-instance activation still forwards `mailto:` links to the running application. The active application opens the editor according to the saved mailto preference.
- `make generate` writes TypeScript bindings to `frontend/bindings/`. Regenerate them after changes to the bound Go API and include the generated files in the same change. CI checks the generated tree after building.
- Startup retains the existing database and credential paths. Both window entries use the same settings and locale catalogs.
- The Wails logger starts at warning level so development startup does not print Go linker flags with built-in OAuth credentials.

## Linux validation

The production build, binding regeneration, frontend check and lint, `go test ./...`, `go vet ./...` and desktop-entry validation passed locally. From a clean copy, `make dev` served both HTML entries through Vite on loopback and rendered the native main window in Xvfb. Knip reported the same findings as the pre-migration baseline.

A native WebKitGTK 2.52.6 smoke test under Xvfb used a temporary database. It verified main-window startup, two independent composers and autosaves, theme and language changes with open editors, a GTK attachment dialog, second-instance `mailto:` routing, Contacts and Calendar, remote image blocking and HTML iframe isolation, and keeping a composer open or saving its draft during quit.

## Follow-up scope

The migration removes macOS support and Flatpak/Flathub packaging, including their release jobs. Windows-specific platform implementations and the [installer inputs](../build/windows/) remain available for a follow-up build and WebView2 validation. Release automation is tracked in the [release workflow](RELEASE.md). Native Wayland, desktop portals and live IMAP, SMTP, OAuth and calendar services remain outside the Linux smoke test.

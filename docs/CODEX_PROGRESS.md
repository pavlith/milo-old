# Milo status

Updated 2026-11-25.

## Current state

- `dev` prepares the first Milo release, `0.0.1`. Linux is the native build and CI target. Contacts and Calendar are experimental first-party extensions. [Release workflow](RELEASE.md) · [Extension reference](EXTENSIONS.md)
- GitHub Private Vulnerability Reporting is enabled. The first-run dialog and About use the approved Milo documents at stable GitHub URLs. [Reporting policy](../SECURITY.md) · [In-app notices](TERMS.md#in-app-notices)

## Architecture and compatibility

- Go and SQLite back the Svelte frontend. The main window and detached composers share one Wails 3 service through generated bindings. Linux uses GTK4 and WebKitGTK 6.0. [Architecture](ARCHITECTURE.md) · [Code map](CODEX_MAP.md)
- Milo opens existing profiles in place and preserves their paths and credentials. SQLite schema versions advance independently of the app version. Both windows share the Carbon appearance and locale settings. [Existing profiles](BUILD.md#existing-profiles) · [Appearance](../frontend/README.md#milo-appearance)

## Limits and next steps

- The legal URLs on `main` still serve the upstream documents. The approved Milo documents will appear there after an approved promotion from `dev`. [Branch workflow](../CONTRIBUTING.md#repository-branches)
- Before publishing the first release, run the Linux release checks. Windows packaging and runtime validation remain pending. [Release checks](RELEASE.md#linux-validation-and-publication)

- UI responsiveness: both window roots now provide zero-delay tooltips; removed the sidebar-specific delay and nonessential shared-control transitions. Native Linux responsiveness and frontend build/lint/check still need validation; a full official registry refresh was not performed. [Interaction feedback](../frontend/README.md#interaction-feedback)

## Confirmed checks

- The `0.0.1` reset passed relative Markdown link and anchor checks, version checks across Go, npm and Windows templates, and `git diff --check`. About rendered `0.0.1` in English and Russian in a browser using the output of `GetAppInfo` through a test transport.
- Database tests and Go vet passed. A focused headless Go test also checked the startup error's profile guide link.
- The legal-notice change passed `npm run check` with zero errors or warnings, `npm run lint` and `git diff --check`.

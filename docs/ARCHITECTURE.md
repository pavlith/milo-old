# Milo architecture

## Process and native windows

The entry point resolves the local profile, handles single-instance activation and registers the Go `App` as a Wails 3 service. Production builds embed Vite's output. Linux hosts the UI in native GTK4 windows with WebKitGTK. [main.go](../main.go) · [Linux build guide](BUILD.md)

The main window loads `index.html` and contains Mail and the enabled Contacts and Calendar panes. Composing can happen inline or in a separate native window that loads `composer.html`. Detached composers share the same process and Go service, with per-window composer state. Wails uses generated Go-to-TypeScript method bindings and events for IPC, including theme and language updates. [Window and frontend entry points](../frontend/README.md#entry-points) · [Detached composer backend](../app/detached_composer.go)

## Mail and local state

SQLite holds account settings, cached mail and drafts, and shared contacts data. The platform package selects XDG profile directories on Linux and preserves compatible older profiles in place. The credential store uses the OS keyring when available and encrypted SQLite fields as a fallback. Persistent profile files and cached data stay in their matching directories. [SQLite](../internal/database/) · [Profile paths](../internal/platform/paths.go) · [Credentials](../internal/credentials/) · [Privacy and local data](PRIVACY.md)

The sync engine uses IMAP to synchronize folders and messages. SMTP handles outgoing mail. OAuth authorization and token refresh use provider configurations from the application or the user. [IMAP](../internal/imap/) · [SMTP](../internal/smtp/) · [Sync](SYNC_REWORK.md) · [OAuth](../internal/oauth2/)

## Extensions

Contacts and Calendar are statically linked first-party extensions. The host registers their UI metadata and exposes extension methods through the same Wails service. Both share the core API and keep extension-owned SQLite data under the profile. Contacts also uses the shared local address book and CardDAV data that power recipient suggestions. [Extension architecture and API reference](EXTENSIONS.md)

## Settings and appearance

The Go settings store persists language, appearance and composer preferences. The frontend initializes both windows from these settings and uses the same Carbon-derived tokens and shared Svelte components. Mode Watcher applies Light, Dark or the system preference. Separate preferences control the backgrounds of displayed mail and the editor body. [Settings store](../internal/settings/store.go) · [Milo appearance](../frontend/README.md#milo-appearance)

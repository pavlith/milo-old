# First-party extensions

Milo links Contacts and Calendar into the application. Both are experimental and disabled by default. Settings controls their availability in the main window. The Go-to-Svelte connection is the same Wails service used by Mail. [Application architecture](ARCHITECTURE.md) · [Extension development rules](EXT_RULES.md)

## Source layout

| Layer | Location |
| --- | --- |
| Manifest metadata and Go registration | [Contacts](../extensions/contacts/manifest.json), [Calendar](../extensions/calendar/manifest.json), and each extension's `manifest.go` and `backend/register.go` |
| Host wiring and promoted Wails methods | [Contacts wiring](../app/extension_contacts.go), [Calendar wiring](../app/extension_calendar.go), [Contacts bridge](../extensions/contacts/backend/bridge.go), [Calendar bridge](../extensions/calendar/backend/bridge.go) |
| Svelte panes, settings and account setup panels | [Contacts frontend](../extensions/contacts/frontend/), [Calendar frontend](../extensions/calendar/frontend/) |
| Host-facing API and implementations | [coreapi](../internal/core/api/v1/), [host adapter](../app/coreimpl.go), [shared extension infrastructure](../internal/extensions/) |

## Lifecycle and windows

1. At startup, the host constructs the extension handles and embeds their bridges in `App`. Each extension's `Register(core)` declares UI metadata, including its rail tab and applicable account setup hooks. Registration happens for both extensions. [Host startup](../app/app.go) · [Contacts registration](../extensions/contacts/backend/register.go) · [Calendar registration](../extensions/calendar/backend/register.go)
2. The host filters rail tabs by enable state. Account setup hooks are available before enablement so users can discover and enable a feature during setup. `SetExtensionEnabled` persists the setting. The frontend reloads its registry and falls back to Mail when disabling the active pane. [Host UI registry bindings](../app/extension_ui.go) · [Frontend registry](../frontend/src/lib/stores/extensionRegistry.svelte.ts)
3. Feature methods normally check the enabled flag before initializing the bridge. The first call that needs the backend initializes it once and opens the extension store. Some discovery and read-only integration methods have narrower behavior documented on their Go definitions. A toggle controls UI and feature access. Initialized stores and services can persist until process exit, and the shared CardDAV scheduler is managed by the host.
4. The main window resolves registration keys to compiled Svelte components. Its rail hosts Mail, Contacts and Calendar. The detached mail composer uses a second frontend entry and the same Wails service. [Window entries](../frontend/README.md#entry-points)

## Core API reference

The Go interfaces under `internal/core/api/v1` define the extension-facing contract within Milo. Wails exposes the flattened `App` methods to TypeScript. The Go interfaces and the generated frontend API serve different callers. [Core interface](../internal/core/api/v1/core.go) · [Lifecycle interface](../internal/core/api/v1/manifest.go) · [Host implementation](../app/coreimpl.go)

| Surface | Purpose |
| --- | --- |
| [Mail](../internal/core/api/v1/mail.go), [Composer](../internal/core/api/v1/compose.go) | Mail and folder operations, mail events, and opening the mail composer |
| [Contacts](../internal/core/api/v1/contacts.go) | Contact lookup, address books, writable sources, contact mutation and events |
| [Auth](../internal/core/api/v1/auth.go) | Scoped HTTP access, OAuth consent and protocol client interfaces. The broker's IMAP and SMTP client methods currently return errors |
| [Storage](../internal/core/api/v1/storage.go) | Namespaced settings and credentials, including scoped secrets |
| [UI](../internal/core/api/v1/ui.go) | UI registration requests and opening URLs. Rail tabs and account setup hooks are connected to the host UI |
| [Events](../internal/core/api/v1/events.go), [Notifications](../internal/core/api/v1/notifications.go), [Logger](../internal/core/api/v1/logger.go), [HTML](../internal/core/api/v1/html.go) | Event publication and subscription, desktop notifications, extension logging and HTML sanitization |

`Core.Extension(id)` resolves an enabled extension's published typed interface where available. `Core.Contacts()` is the host contact surface. Keep method signatures and error handling aligned with their Go definitions. [Core implementation](../app/coreimpl.go) · [API errors](../internal/core/api/v1/errors.go)

## Storage and authorization

Extension-owned tables and migrations live in each extension's `backend/store.go`. They open a SQLite database at `<dataDir>/extensions/<id>/data.db`. Contacts also integrates with the shared local and CardDAV contact stores so synchronized contacts can support mail autocomplete. Calendar keeps calendar data and pending edits in its own store. [Store implementation](../internal/extensions/store.go) · [Contacts storage](../extensions/contacts/backend/store.go) · [Calendar storage](../extensions/calendar/backend/store.go)

The auth broker routes provider HTTP requests by account, extension and scopes. Manifests can declare shared mail OAuth scopes and extension client configuration slots for broader access. Client configuration and provider capabilities affect availability. Credentials and tokens use the host's credential storage. [Auth broker](../internal/extensions/auth/broker.go) · [OAuth configuration registry](../internal/oauth2/clientconfig.go)

## Frontend integration

Use the `$extensions` alias for extension code, `$lib` for shared UI and `$bindings` for generated calls. Bridge methods use `Contacts_` and `Calendar_` prefixes, for example `Contacts_UpdateContact` and `Calendar_CreateEvent`. After changing a bound method, run `make generate` at the root and include the generated changes. [Vite configuration](../frontend/vite.config.ts) · [TypeScript paths](../frontend/tsconfig.json) · [Generated App bindings](../frontend/bindings/github.com/pavlith/milo/app/app.ts)

Reuse shared pane, list, editor and keyboard primitives. Extension keyboard handlers apply in the active rail pane. [UI kit](../frontend/src/lib/components/kit/) · [Shared shortcuts](../frontend/src/lib/keyboard/shortcuts.ts) · [Keyboard reference](KEYBOARD_SHORTCUTS.md#extensions)

### Extension i18n

Each extension exports `registerExtensionI18n` from its frontend `i18n/index.ts`. The shared frontend discovers these registrars and loads `en` and `ru` messages under the extension's namespace. Keep both locale files aligned and run `npm run check:locales` from `frontend/`. [Core locale setup](../frontend/src/lib/i18n/index.ts) · [Translation guide](LANGUAGE.md)

## Verification

Use focused Go tests for bridge, storage and provider behavior, with temporary SQLite data where practical. Use the frontend check and lint scripts for Svelte changes. Verify enablement, the rail and account setup hooks with the native app when changing UI integration. [Linux validation commands](BUILD.md)

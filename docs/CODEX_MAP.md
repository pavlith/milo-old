# Codex repository map

Paths verified against the working tree on 2026-11-23; all paths below are repository-relative. This is a navigation index, not a replacement for the [migration specification](SHADCN_MIGRATION.md). See [progress](CODEX_PROGRESS.md) before starting work.

## Entry points and contracts

| Area | Paths | Notes |
| --- | --- | --- |
| Project conventions | `README.md`, `CONTRIBUTING.md`, `go.mod` | Only `main` (stable) and `dev` (development); workflow in CONTRIBUTING. Go toolchain requirements come from `go.mod`. |
| Native application | `main.go`, `app/`, `wails.json`, `Makefile` | Wails v2 backend bindings and build commands; main embeds frontend output. |
| Main window | `frontend/index.html`, `frontend/src/main.ts`, `frontend/src/App.svelte` | Bootstrap, runtime readiness and application shell. |
| Detached composer | `frontend/composer.html`, `frontend/src/composerMain.ts`, `frontend/src/ComposerApp.svelte` | Separate Vite input and Go binding; verify alongside main window. |
| Generated bridge | `frontend/wailsjs/go/app/`, `frontend/wailsjs/go/models.ts`, `frontend/wailsjs/runtime/` | Generated Go/runtime API; root `make generate` regenerates module bindings. |

## Frontend integration and risk areas

| Area | Verified paths | What to inspect |
| --- | --- | --- |
| Dependencies/checks | `frontend/package.json`, `frontend/package-lock.json`, `frontend/eslint.config.js`, `frontend/knip.json` | npm scripts and dependency baseline. |
| Build/aliases | `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/svelte.config.js` | `$lib`, `$`, `$extensions`, `$wailsjs`; extension dependency aliases and TS inclusion. |
| Tailwind 4 wiring | `frontend/vite.config.ts`, `frontend/src/app.css` | Vite plugin and shared CSS configuration for both windows. Explicit scan paths, HSL token mappings, custom dark variant, animations and editor styles. |
| Theme CSS | `frontend/src/themes.css`, `frontend/src/themes/` | Nord and Dracula palettes; shared radius, avatar defaults and utilities. |
| Theme/settings flow | `internal/settings/store.go`, `internal/settings/store_test.go`, `frontend/src/lib/stores/settings.svelte.ts`, `frontend/src/lib/stores/theme.svelte.ts`, `frontend/src/lib/components/settings/{SettingsDialog,GeneralTab}.svelte` | Nord is the default. Both window entry points apply the shared palettes. The detached composer receives saved changes via IPC. |
| Existing UI foundation | `frontend/src/lib/components/ui/`, `frontend/src/lib/utils.ts` | Bits UI wrappers, custom switch/toasts, `cn`; `frontend/components.json` does **not** exist yet. |
| Dialog regression guards | `frontend/src/lib/components/ui/dialog/dialog-content.svelte`, `frontend/src/lib/components/ui/alert-dialog/alert-dialog-content.svelte`, `frontend/src/lib/stores/dialogGuard.ts` | Scroll-lock/pointer-events fix for chained dialogs; background reload guard. |
| Shared extension UI | `frontend/src/lib/components/kit/`, `frontend/src/lib/stores/extensionRegistry.svelte.ts` | Shared panes/editors and extension integration; inspect consumers before removal. |
| Sidebar and message list | `frontend/src/lib/components/sidebar/`, `frontend/src/lib/components/list/MessageList.svelte`, `frontend/src/lib/components/list/ConversationRow.svelte` | Layout and TanStack virtualization. |
| Viewer and menus | `frontend/src/lib/components/viewer/EmailBody.svelte`, `frontend/src/lib/components/viewer/ConversationViewer.svelte`, `frontend/src/lib/components/common/MessageContextMenu.svelte` | HTML isolation, message actions, keyboard and menu behavior. |
| Composer/signatures | `frontend/src/lib/components/composer/`, `frontend/src/lib/components/settings/account/SignatureEditor.svelte`, `frontend/src/lib/spellcheck/` | TipTap, light editor body, spellcheck and attachment behavior; styles also in app CSS. |
| Notifications/input | `frontend/src/lib/stores/toast.ts`, `frontend/src/lib/components/ui/toast/`, `frontend/src/lib/stores/keyboard.svelte.ts`, `frontend/src/lib/keyboard/shortcuts.ts`, `frontend/src/lib/i18n/` | Preserve APIs, shortcuts and translations. |
| Extensions outside frontend | `extensions/calendar/frontend/`, `extensions/contacts/frontend/` | Included by Vite/TS/Tailwind; `extensions/calendar/frontend/components/MiniCalendar.svelte` imports Bits UI Popover directly. |

## Commands and supporting documentation

- Frontend, from `frontend/`: `npm ci`, then `npm run check`, `npm run lint`, `npm run build`, `npm run knip`. Build hooks copy spellcheck dictionaries; no frontend test script is currently defined.
- Go, from root: targeted `go test` / `go vet` for changed packages; full suite `go test ./...` (`make test`). Full-module compilation needs generated output `frontend/dist` (absent at preparation time) because of `go:embed`; CI builds frontend first. Linux needs GTK/WebKit development libraries.
- Wails, from root: `make dev`, `make build`; Makefile uses `webkit2_41`. Read `docs/BUILD.md` and `Makefile` for native build prerequisites. Do not print expanded credential-bearing build flags.
- CI reference: `.github/workflows/ci.yml` (pushes to `main`/`dev` and pull requests; Node 24, Go 1.25, native libraries and frontend-before-Go build order).
- Dependency packaging: `build/flatpak/flathub/gen-node-sources.py`; Vite comments describe updating Flatpak npm sources and aliases when adding extension dependencies.
- Behavior references: `docs/KEYBOARD_SHORTCUTS.md`, `docs/LANGUAGE.md`, `docs/EXTENSIONS.md`, `docs/EXT_RULES.md`.

Use scoped searches within these areas; verify paths again when code moves. Consult specification §10 for migration validation scenarios rather than copying its checklist here.

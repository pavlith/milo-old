# Milo code map

Start with the [documentation index](README.md) and [progress](CODEX_PROGRESS.md). Follow the links below to the relevant implementation.

| Area | Source and contract |
| --- | --- |
| Native entry, build and profiles | [main.go](../main.go), [app](../app/), [Makefile](../Makefile), [Wails config](../build/config.yml), [profile resolver](../internal/platform/paths.go). Production embeds the Vite output. |
| Main window | [index.html](../frontend/index.html), [main.ts](../frontend/src/main.ts), [App.svelte](../frontend/src/App.svelte). Mail and extension rail navigation live here. |
| Composer | [composer.html](../frontend/composer.html), [composerMain.ts](../frontend/src/composerMain.ts), [ComposerApp.svelte](../frontend/src/ComposerApp.svelte), [detached window Go code](../app/detached_composer.go), [shared composer UI](../frontend/src/lib/components/composer/). |
| IPC and generated bindings | [Bindings](../frontend/bindings/), [desktop wrapper](../frontend/src/lib/desktop.ts), [shared models](../frontend/src/lib/models.ts). Run `make generate` after bound Go API edits. |
| Mail and local storage | [IMAP](../internal/imap/), [SMTP](../internal/smtp/), [sync](../internal/sync/), [SQLite](../internal/database/), [credentials](../internal/credentials/), [OAuth](../internal/oauth2/). |
| Vite and TypeScript | [Vite config](../frontend/vite.config.ts), [TS config](../frontend/tsconfig.json), [npm scripts](../frontend/package.json). Both frontend entries and both extension frontends use these inputs. |
| Appearance and settings | [Carbon CSS and Tailwind setup](../frontend/src/app.css), [theme store](../frontend/src/lib/stores/theme.svelte.ts), [settings store](../frontend/src/lib/stores/settings.svelte.ts), [Go settings](../internal/settings/store.go). The frontend guide describes Light, Dark and System. |
| UI primitives and layout | [shadcn-svelte config](../frontend/components.json), [UI primitives](../frontend/src/lib/components/ui/), [shared kit](../frontend/src/lib/components/kit/), [rail](../frontend/src/lib/components/rail/), [folders](../frontend/src/lib/components/sidebar/), [messages](../frontend/src/lib/components/list/), [viewer](../frontend/src/lib/components/viewer/). |
| Keyboard and localization | [Shared keyboard predicates](../frontend/src/lib/keyboard/shortcuts.ts), [Mail keys in App.svelte](../frontend/src/App.svelte), [locale setup](../frontend/src/lib/i18n/), [locale validator](../frontend/scripts/validate-locales.mjs). |
| Contacts and Calendar | [Extensions](../extensions/), [frontend registry](../frontend/src/lib/stores/extensionRegistry.svelte.ts), [coreapi](../internal/core/api/v1/), [host adapter](../app/coreimpl.go). [Extension reference](EXTENSIONS.md) |

Use the [Linux build guide](BUILD.md), [frontend checks](../frontend/README.md#npm-commands), and [CI workflow](../.github/workflows/ci.yml) for validation commands. For behavior references, see [keyboard shortcuts](KEYBOARD_SHORTCUTS.md), [translations](LANGUAGE.md), and the [architecture overview](ARCHITECTURE.md).

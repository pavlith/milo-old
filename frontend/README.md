# Milo frontend

Milo uses Svelte 5 and TypeScript with Vite inside Wails 3. Vite builds both windows and includes first-party extension UI. The Wails development configuration serves both entries on loopback. [Linux development setup](../docs/BUILD.md) · [Architecture](../docs/ARCHITECTURE.md)

## Entry points

| Window | HTML and bootstrap | Root component |
| --- | --- | --- |
| Main window with Mail, Contacts and Calendar | [index.html](index.html), [main.ts](src/main.ts) | [App.svelte](src/App.svelte) |
| Detached composer | [composer.html](composer.html), [composerMain.ts](src/composerMain.ts) | [ComposerApp.svelte](src/ComposerApp.svelte) |

Both entries load [app.css](src/app.css) and initialize shared appearance and localization. Go methods and events reach the windows through Wails. Use the generated TypeScript API under [bindings](bindings/) via the `$bindings` alias. After a bound Go API changes, run `make generate` from the repository root and review the generated diff. CI checks that the bindings in Git match the build.

## UI structure

- [Shared primitives](src/lib/components/ui/) are shadcn-svelte components backed by Bits UI. [components.json](components.json) defines the registry, aliases, and CSS entry. The app uses Iconify icons. Shared pane, list and editor elements live in the [UI kit](src/lib/components/kit/).
- The Mail shell uses the [rail](src/lib/components/rail/), [folder sidebar](src/lib/components/sidebar/), [message list](src/lib/components/list/) and [viewer](src/lib/components/viewer/). PaneForge powers the shared resizable primitives, and TanStack Virtual windows long mail lists.
- Formsnap connects account fields to validation and accessible descriptions. Runed provides debounce and event listener cleanup. TipTap powers composition, signature editing and the Calendar rich-text editor.
- Contacts and Calendar own their Svelte code under [extensions](../extensions/), and the main window mounts their panes through the [extension registry](src/lib/stores/extensionRegistry.svelte.ts). [Extension development](../docs/EXTENSIONS.md)
- The shared `svelte-i18n` setup loads English and Russian catalogs, including extension namespaces. [Translation guide](../docs/LANGUAGE.md)

## Milo appearance

Both windows use IBM Carbon White and Gray 100 as the basis of their Light and Dark palettes. System follows the OS preference through Mode Watcher and is the default for new profiles. The settings store maps retired Nord and Dracula values to Dark. [CSS tokens](src/app.css) · [Frontend theme store](src/lib/stores/theme.svelte.ts) · [Go settings store](../internal/settings/store.go)

Use shared shadcn-svelte components and semantic utilities such as `bg-background`, `text-foreground` and `border-border`. Mail content and the composer body have independent background preferences. The HTML message body uses its own settings inside the isolated message frame.

The UI bundles local Inter Variable and JetBrains Mono Variable subsets. The font licenses ship with the assets. The canonical mark is [milo.svg](src/assets/images/milo.svg). [Bundled licenses](public/licenses/) · [Platform icons](../build/)

### Interaction feedback

Both window roots provide Bits UI tooltips with zero opening delay. The sidebar layout inherits that provider instead of imposing its own delay. Shared buttons, tabs and form controls use immediate color feedback; tooltips do not animate their visibility. Keep motion for meaningful state changes (such as the switch thumb), and respect reduced-motion preferences. Do not disable all application animations globally.

## npm commands

Use Node.js 24 and the checked-in [npm lockfile](package-lock.json). Run these commands from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependencies |
| `npm run check` | Validate catalogs and check Svelte and TypeScript |
| `npm run lint` | Run ESLint |
| `npm run build` | Produce both Vite entries in `dist/` |
| `npm run knip` | Inspect unused files, exports and dependencies |
| `npm run dev` | Run Vite. The root `make dev` starts Vite and the native app together |

The dev and build scripts prepare the bundled spellcheck dictionaries. [Frontend conventions](AGENTS.md)

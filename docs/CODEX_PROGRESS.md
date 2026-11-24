# Codex progress

Updated 2026-11-24. The Linux Wails 3 migration is complete. UI migration requirements are in [SHADCN_MIGRATION.md](SHADCN_MIGRATION.md) and paths are in [CODEX_MAP.md](CODEX_MAP.md).

## Milestones

| Milestone | Status | Evidence / exit condition |
| --- | --- | --- |
| Codex preparation | Complete | Short root/frontend instructions, verified map and this handoff added; documentation checks only. |
| Stage 1: Audit | Complete | Inspected the locked dependencies, existing UI and stylesheet inputs. Captured the four local baseline results. |
| Stage 2: Tailwind 4 | Complete | Validated both Vite entries, extension CSS and representative computed styles in Linux WebKitGTK. Native application validation remains listed below. |
| Stage 3: Themes | Complete | Validated the two palettes, settings migration, both native Linux windows and detached composer IPC. |
| Pre-v1 cleanup and localization | Complete | Removed system-theme compatibility and unused archives. Mail, Contacts and Calendar ship English and Russian. |
| Wails 3 on Linux | Complete | Clean-copy builds and development startup, Go and frontend checks, and the Linux multi-window smoke test passed. See [WAILS3_MIGRATION.md](WAILS3_MIGRATION.md). |
| Stage 4: shadcn-svelte | Not started | Follow §§5–6; existing wrappers untouched. |
| Stage 5: Application UI | Not started | Follow §8; preserve both windows and extensions. |
| Stage 6: Cleanup | Not started | Follow §9 after consumer verification. |
| Stage 7: Validation | Not started | Follow §§10–12; preparation checks are not migration acceptance. |

## Audit and Tailwind decisions

- Baseline `65bbb51` locked Tailwind 3.4.19, Vite 6.4.1, Svelte 5.53.9 and Bits UI 1.8.0. Both windows import `app.css`. The old Tailwind/PostCSS configs supplied the semantic colors, fonts, breakpoints and three named animations. The CSS theme registry supplies HSL channels for application chrome, the editor and avatar utilities. The shared theme store applies the selected palette and mirrors dark mode on the root.
- Dialog, alert dialog, select, tabs and menus wrap Bits UI. App dialogs, message/folder menus and the calendar MiniCalendar also use primitives directly. The Tailwind changes keep their APIs and dialog scroll-lock fixes. TipTap, viewer iframe, toast, switch and virtualization remain in place.
- Tailwind and `@tailwindcss/vite` are at 4.3.5. Upgraded `tailwind-merge` to 3.7.1 for `cn`. Removed the direct PostCSS and Autoprefixer dependencies and the unused typography plugin and Tailwind Variants. Kept the npm lockfile and regenerated Flatpak npm sources.
- Vite loads the Tailwind plugin. `app.css` holds `@theme inline` mappings for existing HSL channels, `@theme` constants, the class-based dark variant and explicit sources for both HTML entries, app source and `extensions/**/frontend/`. Preserved the CSS palette files and editor rules. Reinstated semantic border, placeholder and enabled-button cursor defaults. Updated outline and small shadow/blur classes and removed the previously inert `ml-13` that v4 would activate. The three named animations carry forward in CSS. Existing dialog `animate-in`/exit classes had no corresponding plugin output in the baseline.
- Knip's one dependency exception covers `tailwindcss`, which the Vite build resolves from the CSS import. See the [Tailwind upgrade guide](https://tailwindcss.com/docs/upgrade-guide) and [source detection guide](https://tailwindcss.com/docs/detecting-classes-in-source-files).

## Decisions

- Keep always-loaded instructions small; load the map, relevant source and specification sections on demand. Store only durable deltas here; do not repeat the specification or raw logs.
- Use only `main` and `dev`, per the user's preference. The user authorized moving preparation to `dev`, committing/pushing the updates and deleting the old preparation branch after verifying commit preservation. Workflow source: [CONTRIBUTING.md](../CONTRIBUTING.md#repository-branches).
- Initial preparation was published as `ea325d5` on `chore/codex-preparation`; renaming to `dev` preserves that commit. The specification was initially untracked; now include it in Git with only its branch policy updated so fresh clones have the requirements.
- Existing `.gitignore` ignores `AGENTS.md` at every depth; explicitly force-add the two requested instruction files without changing ignore rules.

## Validation and limitations

Local Node 26.13.0 with clean `npm ci` before and after. The [baseline GitHub CI run](https://github.com/pavlith/petchkin/actions/runs/45226067256) also passed on `dev`.

| Check | Tailwind 3 baseline | Tailwind 4 |
| --- | --- | --- |
| `npm run check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `npm run lint` | Passed | Passed |
| `npm run build` | Passed with existing chunk and dynamic-import warnings | Passed with the same warnings and both HTML entries |
| `npm run knip` | Exit 1, existing unused items | Exit 1, same findings except removed Tailwind Variants |

- Compared production CSS selectors and confirmed that app and extension utilities remain generated. Vite dev served both HTML inputs and the shared CSS, including calendar and contacts utilities.
- An offscreen Linux WebKitGTK 2.52.6 smoke check loaded styles referenced by each production entry. It verified 28 theme selectors, semantic opacity, dark variants, ring and disabled styles, extension layout utilities, editor and spellcheck styles, iframe isolation and virtual row positioning. Interactive Wails GUI workflows and Windows/macOS WebViews remain unverified.
- `go test -tags webkit2_41 ./...` passed in packages that compiled. Packages requiring GDK/GLib failed to build because development files are absent. Native Wails build requires those files, GTK/WebKitGTK development packages and the Wails CLI.

## Stage 3 themes

- Nord (`nord-dark`) and Dracula (`dracula`) are the only selectable palettes. Both HTML entries start in Nord with the `.dark` class. Shared HSL tokens, radius, avatars and Tailwind utilities serve both windows. Adjusted Dracula muted text and Nord destructive backgrounds for contrast.
- Go preserves the two saved values, uses Nord on fresh installs and writes Nord back over invalid or legacy `theme_mode` rows. The setter rejects unsupported input. The main window applies the saved theme before mounting. The picker previews locally, saves through Wails and sends the saved theme to open composers. Detached composers subscribe before reading the shared settings. The IPC reader stays active after authentication.
- Removed the Nord Light block and nine CSS files under `frontend/src/themes/` (`adwaita.css`, `breeze.css`, `built-in.css`, `catppuccin.css`, `github.css`, `pop.css`, `tokyo-night.css`, `vs-code.css`, `yaru.css`). Removed OS theme listeners and obsolete translations. The Wails system-theme methods remain available for compatibility.
- Frontend check and lint passed. Production build passed with baseline warnings. Knip still exits 1 for baseline findings and reports one fewer unused export. Both built HTML entries reference CSS with exactly two palettes. Offscreen WebKitGTK 2.52.6 verified all semantic tokens, dark variants, opacity, rings, avatars, light editor styles and spellcheck under both themes.
- `go test -tags webkit2_41 ./...`, `go vet -tags webkit2_41 ./...`, `go test -race ./internal/settings` and the Wails build passed using GTK/WebKitGTK development files in a temporary sysroot. The Windows IPC package cross-compiled and passed vet.
- Native Wails on Linux under Xvfb verified a fresh install, legacy write-back, theme preview and cancel, save and restart, updates to a running composer, newly opened composers, light and dark editor bodies, and rich signatures. A local message fixture verified both mail rendering modes, iframe isolation and remote image blocking in both themes. Windows/macOS WebViews and live mail send/sync were outside this smoke test.

## Documentation/workflow review

- Reviewed documentation inventory and branch instructions across root, frontend, docs, packaging and archive material. Replaced task/versioned-branch guidance in AGENTS, contributions, translations and migration specification; linked release and Flathub exceptions to the shared workflow.
- CI previously ran only on PRs; enable pushes to `dev` and `main` for direct development. Existing release automation writes its manifest to `main`; synchronize that back to `dev` before promotion. No release/tag is created by this task.
- Workflow update checked by parsing YAML and asserting the push branches/PR trigger. Guidance links, instruction size and whitespace checked; application tests/builds not run for documentation and trigger-only changes. GitHub CI results remain separate from these local checks.
- Corrected contribution prerequisites and nonexistent frontend test command against manifests/CI; identified frontend README as template background rather than SvelteKit guidance.
- Remaining documentation debt outside branching: `docs/EXT_RULES.md` references missing `docs/EXTENSION_ARCHITECTURE.md` and older OAuth registration paths, while `docs/EXTENSIONS.md` describes newer shared credentials. Reconcile those architecture rules against code in a separate focused review; do not infer permission to refactor from stale prose. Historical changelog, archive, security/legal records and external Flathub branch examples are retained.

## Pre-v1 cleanup and localization

- Removed the Wails system-theme endpoints and the unused platform theme files. Invalid or missing themes use Nord without a database write-back. Nord, Dracula, detached theme IPC and the independent mail and editor backgrounds are retained.
- Removed the archived AppImage work, old Go backup and retired raster icon. Modern icons, Flatpak, Wails v2, desktop integration, mail and OAuth flows, schema migrations and database rollback support stay in place.
- Removed 38 catalog files for 13 former UI locales. The English and Russian catalogs cover 965 core, 142 Contacts and 315 Calendar messages. Both windows read the persisted preference before mount, and saving a language updates open composers through IPC. See [LANGUAGE.md](LANGUAGE.md) for selection, fallback and dictionary behavior.
- The locale validator runs with `npm run check` in CI. It passed for all three catalogs and rejected malformed JSON, altered keys, types and placeholders, malformed ICU syntax and unsupported registrations in isolated fixtures. Production assets contain six translation chunks (one EN and one RU per catalog).
- Frontend check and lint passed. Production build passed with the baseline Vite warnings. Knip reported the baseline findings with two fewer unused exports and no new findings. Native Linux Wails build, `make generate`, full Go tests and vet with `webkit2_41`, settings/IPC race tests and desktop file validation passed. AppStream reports the same historical release-note warning and notices as the base revision.
- The Linux WebKitGTK smoke test used isolated data under Xvfb. It covered both windows and themes, Russian system detection, switching with a composer open, saved-language restart, unsupported preference fallback, Russian date formatting, Contacts and Calendar, OAuth labels, the draft dialog, tooltips and editor content retention. Windows/macOS WebViews and live mail, calendar or OAuth servers were outside this run.

## Next action

Stage 4 — shadcn-svelte integration on the Wails 3 baseline. Follow §§5–6 of [SHADCN_MIGRATION.md](SHADCN_MIGRATION.md).

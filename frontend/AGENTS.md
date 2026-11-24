# Frontend: Codex instructions

- Plain Svelte 5 + TypeScript + Vite inside Wails v3; keep both the main and composer entries. Do not introduce SvelteKit.
- Use typed `$props`, `$state`, `$derived`, `$bindable` and snippets consistent with nearby code. Preserve component APIs, bindings, events, localization and keyboard accessibility; do not suppress new type errors.
- Use `components.json` with the official shadcn-svelte CLI in a temporary copy. Compare candidates with the existing wrappers and consumers before adapting `src/lib/components/ui/`. Use the shared `cn()`, Tailwind Variants for component variants, typed Bits UI props, `data-slot` and existing Iconify icons.
- Tailwind 4 uses the Vite plugin and CSS configuration in `src/app.css`. Keep Vite/TypeScript aliases aligned and preserve both HTML entries and extension scan paths. Use statically discoverable classes and consistent semantic colors. Consult specification §§5–6 before shadcn integration.
- Preserve Bits UI dialog focus/overlay behavior and `preventScroll` fixes, TanStack virtualization, TipTap/spellcheck, toast API and email HTML isolation from Preflight. Check both windows and extension consumers; see `../docs/CODEX_MAP.md` for paths.
- Theme changes follow specification §7 across Go and frontend, including persistence and normalization. Retain independent email/editor background preferences.
- Use npm with `package-lock.json` (`npm ci` for reproducible installation); do not add another lockfile. From `frontend/`, relevant scripts are `npm run check`, `npm run lint`, `npm run build`, `npm run knip`; there is no `test` script. Record baseline failures separately from regressions.
- For substantive migration milestones, run those four scripts and applicable Go/Wails checks (map); report native WebView/manual checks only when performed. Documentation-only work follows root validation rules.
- Treat `bindings/` as generated: change Go APIs first and use root `make generate` when needed. Avoid dependency churn or broad formatting unrelated to the task.

# Frontend: Codex instructions

- Plain Svelte 5 + TypeScript + Vite inside Wails v2; keep both main and detached composer entry points. Do not introduce SvelteKit or Wails v3.
- Use typed `$props`, `$state`, `$derived`, `$bindable` and snippets consistent with nearby code. Preserve component APIs, bindings, events, localization and keyboard accessibility; do not suppress new type errors.
- Reuse `src/lib/components/ui/`, `src/lib/utils.ts` (`cn`) and Tailwind Variants. Inspect existing wrappers and consumers before shadcn CLI generation; compare in a temporary directory rather than overwriting customized components.
- Tailwind 4/shadcn-svelte are migration targets, not the current baseline. Consult specification §§4–6 and official Vite installation docs when authorized to migrate; keep aliases in Vite/TypeScript aligned and extension CSS scanning intact. Use statically discoverable classes and one consistent semantic-token color format.
- Preserve Bits UI dialog focus/overlay behavior and `preventScroll` fixes, TanStack virtualization, TipTap/spellcheck, toast API and email HTML isolation from Preflight. Check both windows and extension consumers; see `../docs/CODEX_MAP.md` for paths.
- Theme changes follow specification §7 across Go and frontend, including persistence/normalization; retain independent email/editor background preferences. Do not change themes during preparation.
- Use npm with `package-lock.json` (`npm ci` for reproducible installation); do not add another lockfile. From `frontend/`, relevant scripts are `npm run check`, `npm run lint`, `npm run build`, `npm run knip`; there is no `test` script. Record baseline failures separately from regressions.
- For substantive migration milestones, run those four scripts and applicable Go/Wails checks (map); report native WebView/manual checks only when performed. Documentation-only work follows root validation rules.
- Treat `wailsjs/` as generated: change Go APIs first and use root `make generate` when needed. Avoid dependency churn or broad formatting unrelated to the task.

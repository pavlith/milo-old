# Codex progress

Updated: 2026-11-23. Scope of this change: repository preparation only. **UI migration has not started.** Requirements remain in [SHADCN_MIGRATION.md](SHADCN_MIGRATION.md); navigation is in [CODEX_MAP.md](CODEX_MAP.md).

## Milestones

| Milestone | Status | Evidence / exit condition |
| --- | --- | --- |
| Codex preparation | Complete | Short root/frontend instructions, verified map and this handoff added; documentation checks only. |
| Specification §11, stage 1: Audit | Partial | Structure/integration points inspected; baseline checks and detailed component/API inventory remain. |
| Stage 2: Tailwind 4 | Not started | Follow specification §4 after audit baseline. |
| Stage 3: Themes | Not started | Follow §7; no theme/settings changes made. |
| Stage 4: shadcn-svelte | Not started | Follow §§5–6; existing wrappers untouched. |
| Stage 5: Application UI | Not started | Follow §8; preserve both windows and extensions. |
| Stage 6: Cleanup | Not started | Follow §9 after consumer verification. |
| Stage 7: Validation | Not started | Follow §§10–12; preparation checks are not migration acceptance. |

## Verified starting point

- Manifests declare Svelte `^5.16.0`, Vite `^6.0.6`, Tailwind `^3.4.17`, Bits UI `^1.0.0-next.74`, tailwind-merge `^2.6.0`, tailwind-variants `^0.3.0`; these are declared ranges, not installed-version claims. Go module requires Go 1.25.0 and Wails v2.16.0.
- UI wrappers and `cn` already exist; shadcn configuration does not. Tailwind/PostCSS still use v3 wiring and HSL channels.
- Themes still include light/system and multiple palettes; Go default is `system`. Both windows share theme application, with different injected Go bindings.
- Extensions live outside frontend; alias resolution, TypeScript inclusion and Tailwind scanning already account for them. Dialog wrappers contain application-specific scroll-lock fixes.

## Decisions

- The explicit preparation request limits this change despite the specification's broader implementation directive. No source, dependency, configuration or existing documentation changes.
- Keep always-loaded instructions small; load the map, relevant source and specification sections on demand. Store only durable deltas here; do not repeat the specification or raw logs.
- Work on `chore/codex-preparation`: repository started on `main`, with no local `dev` branch. The user subsequently authorized committing and pushing this preparation branch.
- The supplied specification was already untracked at start. Preserve its bytes and leave it unstaged; preparation commit contains only the four new guidance files. A fresh clone will need the specification added separately by its owner.
- Existing `.gitignore` ignores `AGENTS.md` at every depth; explicitly force-add the two requested instruction files without changing ignore rules.

## Validation and limitations

- Preparation checks passed: existing map paths and relative Markdown links, package scripts, absent shadcn config and short instructions (10 root / 11 frontend lines). Generated `frontend/dist` is explicitly marked absent. Whitespace and staged file scope checked before committing.
- No frontend/Go checks, production build, Wails build or GUI tests run: this change is documentation-only. Existing check failures and native runtime behavior are therefore unknown.
- Initial commit attempt failed because 1Password SSH signing could not connect to its socket. Signing was not disabled; see Git history for the subsequent commit result.

## Next actions when migration is requested

1. Finish stage 1: resolve installed/locked versions and component consumers, including direct Bits UI use in extensions; establish the four frontend script results and applicable Go/Wails baseline using map commands. Separate pre-existing failures from new regressions.
2. Compare current official Tailwind 4 and shadcn-svelte Vite guidance with existing configs and customized wrappers; record compatibility decisions before dependency edits.
3. Proceed through specification §11 in order, stopping for critical failures. Update this file after each milestone with changed paths, actual validation results, decisions and the next action; retain native/GUI scenarios as unverified until exercised.

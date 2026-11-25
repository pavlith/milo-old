# Milo: Codex instructions

- Start with `docs/CODEX_PROGRESS.md`; use `docs/CODEX_MAP.md` to locate relevant code. Read applicable README/manifests and `CONTRIBUTING.md` before edits.
- Use `docs/README.md` for active documentation and `frontend/README.md#milo-appearance` for appearance guidance.
- Keep context small: use scoped `rg`, bounded file reads and focused diffs. Do not load whole trees, lockfiles, generated bindings, assets or archives unless needed. Summarize findings instead of pasting logs/specification.
- Preserve unrelated working-tree changes, documentation and mail behavior. Keep changes focused; prefer guard clauses and existing architecture. Do not expose credentials, keys or mail data.
- Go: use `gofmt`; run relevant `go test` and `go vet` for substantive changes. Frontend rules are in `frontend/AGENTS.md`; apply them also when editing extension frontend code outside that directory.
- Use existing scripts and lockfile. For documentation-only changes, verify paths and `git diff --check`; skip builds/tests. Report actual checks and untested scenarios.
- Update progress with completed work, decisions, validation and any pending action; link requirements instead of duplicating them.
- Check `git status` before editing/staging. Use only `main` (stable) and `dev` (all development); do not create task/release branches. Track `origin/dev` if available; create `dev` from `main` only if absent locally and remotely. Promote to `main` only when requested; see `CONTRIBUTING.md`. Commit/push only when authorized.

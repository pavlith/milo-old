# Release workflow

Approve releases separately from development work. Merge any newer `main` commits into `dev`, validate the result, then open a `dev` → `main` pull request that preserves branch ancestry. The branch policy is in [CONTRIBUTING.md](../CONTRIBUTING.md#repository-branches).

For a native Linux release, keep the version in `app/state.go`, `build/config.yml` and `frontend/package.json` aligned. Follow [BUILD.md](BUILD.md) to build and validate the executable. The Windows version settings remain in `build/windows/` for future installer work.

Automated publishing is deferred for the Wails 3 migration. Creating a release or tag requires separate approval.

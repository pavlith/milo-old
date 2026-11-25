# Milo release workflow

## Branches and versions

Use `dev` for development and `main` for approved stable code. Before promotion, incorporate any newer `origin/main` commits into `dev` and validate the result. Merge the approved `dev` → `main` pull request with ancestry preserved. Create release tags on `main` after approval. [Branch policy](../CONTRIBUTING.md#repository-branches)

Keep the app version in `app/state.go`, `build/config.yml` and `frontend/package.json` aligned. Update both root package version fields in `package-lock.json`. About and `--version` read the Go version. The Windows templates use the Wails product version from `info.version` in `build/config.yml` and append `.0` where Windows requires four parts. Record user-visible changes in the changelog. [Go version](../app/state.go) · [Wails metadata](../build/config.yml) · [npm manifest](../frontend/package.json) · [npm lockfile](../frontend/package-lock.json) · [Windows templates](../build/windows/) · [Changelog](../CHANGELOG.md)

## Linux validation and publication

1. Use the toolchain in the [Linux guide](BUILD.md). Run a clean `npm ci` in `frontend/`, then `make build` from the root.
2. Check that the generated bindings match Git. Run frontend check and lint, `go test ./...` and `go vet ./...` as in [CI](../.github/workflows/ci.yml). Run the [native Linux smoke test](BUILD.md#focused-linux-regression-test) on the production binary.
3. Verify the desktop entry and install layout, for example with `desktop-file-validate` and a staged `make install` using `DESTDIR`. Confirm any built-in OAuth configuration for the intended distribution build.
4. Publish the approved native Linux artifacts manually. The current CI workflow validates builds. Release packaging and publishing are separate steps.

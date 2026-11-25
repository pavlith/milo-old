# Contributing to Milo

Keep project discussions respectful and inclusive.

## Repository branches

- `dev` holds development, fixes, documentation and translations. Work directly on `dev` in the maintainer checkout and target `dev` in translation pull requests.
- `main` holds stable, reviewed code. Promote approved changes through a `dev` → `main` pull request with a merge that preserves ancestry. Release tags belong on `main`.

Stay on these two branches in the maintainer repository. Before a promotion, incorporate any newer `origin/main` commits into `dev` and validate the result. Avoid force-pushing either branch. Commits, pushes, promotions and releases require task authorization. [Release workflow](docs/RELEASE.md)

## Report a bug or propose a change

Search existing issues first and use the relevant GitHub template. Include your Milo revision, operating system and relevant steps for a bug. Remove account details and secrets from logs and screenshots. Use the private reporting guidance for security findings. [Issues](https://github.com/pavlith/milo/issues) · [Security policy](SECURITY.md)

Milo accepts translation pull requests at present. Discuss other contributions in an issue first. Keep English and Russian catalogs aligned for translation fixes. [Translation guide](docs/LANGUAGE.md)

## Development setup

Install the [Linux prerequisites](docs/BUILD.md#prerequisites), then run:

```sh
git clone --branch dev https://github.com/pavlith/milo.git
cd milo
make dev
```

The Makefile installs locked frontend dependencies when absent and runs the pinned Wails CLI. Use `npm ci` from `frontend/` for a clean dependency install. Local built-in OAuth credentials are optional. [Build and OAuth setup](docs/BUILD.md#build-develop-and-install) · [Frontend guide](frontend/README.md)

## Code and validation

- Format Go changes with `gofmt`. Prefer guard clauses, contextual errors and the existing zerolog components. Follow nearby package conventions.
- Use typed Svelte 5 runes and shared UI primitives. Preserve localization, keyboard interaction and both window entry points. [Frontend instructions](frontend/AGENTS.md)
- Use `make generate` after changing a bound Go API. Include generated changes in the same commit.
- Test critical paths for behavior changes. `make test` prepares frontend assets and runs Go tests. Run relevant Go vet and frontend checks. See [CI](.github/workflows/ci.yml) and the [Linux smoke test](docs/BUILD.md#focused-linux-regression-test).
- For documentation-only changes, check references and `git diff --check`.

Use a short descriptive commit subject with the project's prefix, for example `fix: preserve draft state when detaching the composer` or `docs: clarify Linux build prerequisites`.

## License

Contributions to Milo are licensed under the Apache License 2.0. [License text](LICENSE)

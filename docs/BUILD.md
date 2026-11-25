# Build on Linux

Linux is Milo's native build and CI target. The desktop binary uses GTK4 and WebKitGTK 6.0.

## Prerequisites

- Go 1.26 or newer, as specified in [go.mod](../go.mod).
- Node.js 24 and npm, matching [Linux CI](../.github/workflows/ci.yml). Use the [checked-in npm lockfile](../frontend/package-lock.json).
- Git, Make, a C compiler, pkg-config, and the GTK4 and WebKitGTK 6.0 development libraries. On Ubuntu 24.04 install these packages:

  ```sh
  sudo apt install git make build-essential pkg-config libgtk-4-dev libwebkitgtk-6.0-dev
  ```

The [Makefile](../Makefile) runs Wails `v3.2.0-nightly.20261123`, matching the Go dependency. The corresponding JavaScript runtime is pinned in [package.json](../frontend/package.json).

## Build, develop and install

From the repository root:

| Command | Result |
| --- | --- |
| `make build` | Install frontend dependencies if absent, regenerate bindings, build frontend assets and compile `build/bin/milo` |
| `./build/bin/milo` | Launch the native build |
| `make dev` | Build the development binary and run it with Vite at `127.0.0.1:5173` |
| `make generate` | Regenerate the TypeScript bindings in `frontend/bindings/` |
| `make test` | Prepare frontend assets and run `go test ./...` |
| `make install` | Build and install the executable, icons and desktop entry under `/usr/local` by default |

Use `make install PREFIX="$HOME/.local"` for an installation under your home directory. `DESTDIR` stages the files under a packaging root. Use the same `PREFIX` and `DESTDIR` with `make uninstall`. The desktop entry registers the `mailto:` handler. Desktop environments may require separately selecting Milo as the default mail application.

Build with an empty credentials configuration for password accounts or user-configured OAuth. To include built-in OAuth clients in a local build, use the variables in [.env.example](../.env.example). Keep values in ignored `.env` or `.env.local` files. `.env.local` takes precedence. Make injects those values at link time, so avoid sharing build output that prints expanded flags.

CI builds on Ubuntu 24.04, checks generated bindings, runs frontend check and lint, and runs Go test and vet. See the [frontend command reference](../frontend/README.md#npm-commands) and the [release workflow](RELEASE.md).

## Focused Linux regression test

Build the production binary and install Python 3 and Xvfb:

```sh
python3 tests/linux/ui_smoke.py
```

The test uses temporary XDG profiles and a loopback fixture. It covers the legacy profile, Carbon modes, bundled fonts, Contacts, keyboard pane resizing, detached composition and a cold `mailto:` launch. Pass `--binary PATH` to test a specific production build. [Smoke test source](../tests/linux/ui_smoke.py)

## Existing profiles

Fresh Linux profiles use `milo` under the XDG config, data and cache homes. The default primary database is `$XDG_DATA_HOME/milo/milo.db` (usually `~/.local/share/milo/milo.db`).

Milo checks profile directories in the order `milo`, `petchkin`, `aerion`. In each directory it checks `milo.db`, `petchkin.db` and `aerion.db` in that order. It opens the first match in place and keeps that profile's config and cache directories. This preserves the database and its SQLite sidecars, keys, cached files, absolute attachment paths and existing keyring entries. Profiles remain separate. When start on login is enabled, Milo replaces the older Linux login launcher after creating its own. [Profile resolver](../internal/platform/paths.go)

Before opening a legacy profile, quit the old application and back up the profile directories, keys and any referenced attachments. Preserve access to the original OS keyring entries. Milo applies forward-only SQLite migrations and refuses to open a database with a newer schema than the build supports. If that happens, use a build that supports the database schema, or restore a compatible pre-upgrade backup before returning to an older build. The application version and the SQLite schema version are independent. [Database migration code](../internal/database/database.go)

Saved Nord and Dracula preferences resolve to Dark. Fresh profiles default to System. Change the mode under **Settings → General → Appearance**. [Appearance guide](../frontend/README.md#milo-appearance)

For local diagnostics, use `MILO_DEBUG`, `MILO_LOG_LEVEL` or `MILO_LOG_FILE`. Review logs for account details or message metadata before sharing them.

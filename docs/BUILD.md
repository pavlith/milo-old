# Build on Linux

Use Go 1.26 or newer, Node.js 24 with npm, a C compiler, pkg-config, GTK4 and WebKitGTK 6.0. On Ubuntu 24.04 or newer:

```sh
sudo apt install build-essential pkg-config libgtk-4-dev libwebkitgtk-6.0-dev
```

`make` uses the Wails v3 CLI pinned to `v3.2.0-nightly.20261123`. To install the same CLI separately, run:

```sh
go install github.com/wailsapp/wails/v3/cmd/wails3@v3.2.0-nightly.20261123
```

```sh
make dev      # Linux application with Vite on 127.0.0.1:5173
make build    # build/bin/aerion
make test     # frontend assets and Go tests
make generate # refresh TypeScript bindings
```

Run `./build/bin/aerion` to launch without installation. `make install` installs the Linux executable, icons and mailto desktop entry under `/usr/local` by default. Override `PREFIX` to choose another location.

Built-in OAuth clients need the values documented in `.env.example`. Keep local values in the ignored `.env` file. Password accounts and user-provided OAuth clients remain available with an empty build environment.

For Windows resource status and the validation scope, see [WAILS3_MIGRATION.md](WAILS3_MIGRATION.md).

## Focused Linux regression test

Run this test after building the production binary and installing Python 3 and Xvfb.

```sh
python3 tests/linux/ui_smoke.py
```

The test starts Wails with temporary XDG directories and a loopback-only fixture. It checks pending Contacts search cleanup, PaneForge keyboard resizing, Ctrl+N from a focused separator, and the saved Plain Text preference in a detached composer. Pass `--binary PATH` to test a specific production build.

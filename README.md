# Milo

<img src="frontend/src/assets/images/milo.svg" width="80" height="80" alt="Milo logo">

Milo is a lightweight, Linux-first desktop email client for IMAP and SMTP.

## Overview

Manage several accounts in one desktop app. Read threaded conversations, find messages in the local cache or on the server, and write in the main window or a separate composer. The interface supports keyboard navigation, Vim-style shortcuts, and English and Russian.

## Features

- Multiple accounts, a unified inbox, and resizable mail panes.
- Local and IMAP search, desktop notifications, and `mailto:` handling.
- Rich-text and plain-text composition, drafts, signatures, and attachments.
- Password and OAuth 2.0 authentication, with provider-specific or custom client configuration where applicable.
- OpenPGP and S/MIME signing and encryption. Remote images in messages are blocked by default.
- Carbon-based Light, Dark, and System appearance modes, with independent backgrounds for mail content and composition.

**Experimental.** Contacts and Calendar ship as first-party alpha extensions. Enable them individually in Settings.

**Planned.** Windows build and runtime validation.

## Tech stack

Go and SQLite power the backend. Wails 3 hosts two Svelte 5 and TypeScript entry points in native windows. The UI uses Vite, Tailwind CSS 4, shadcn-svelte with Bits UI, and TipTap.

## Platform support

Linux is the primary supported platform and the target of the native build and CI, using GTK4 and WebKitGTK 6.0. Windows platform code and installer resources remain in the tree for future validation.

## Quick start

After installing the [Linux prerequisites](docs/BUILD.md#prerequisites), clone the repository and run Milo:

```sh
git clone https://github.com/pavlith/milo.git
cd milo
make build
./build/bin/milo
```

Open Settings to add an account. See the build guide before using an existing profile or configuring OAuth.

## Building from source

The build uses Go 1.26 or newer, Node.js 24 with npm, and the Wails version pinned in the Makefile. `make build` installs frontend dependencies if needed, regenerates bindings, and produces `build/bin/milo`. The Linux guide covers desktop installation, development, testing, and profile compatibility. [Build on Linux](docs/BUILD.md)

## Documentation

- [Documentation index](docs/README.md)
- [Keyboard shortcuts](docs/KEYBOARD_SHORTCUTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Privacy and local data](docs/PRIVACY.md), [Terms](docs/TERMS.md), and [Security](SECURITY.md)

## Development and contributing

Develop on `dev` with `make dev`. The repository uses `main` for stable code. [Contribution guide](CONTRIBUTING.md) · [Frontend guide](frontend/README.md)

## Credits

Milo is based on the Aerion desktop mail client by hkdb and the Aerion contributors. [Aerion source](https://github.com/hkdb/aerion)

## License

Apache License 2.0. [License text](LICENSE)

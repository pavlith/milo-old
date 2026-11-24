# Aerion Email Client - Build System
# 
# Usage:
#   make build    - Build production binary
#   make dev      - Run in development mode
#   make help     - Show all available targets
#
# OAuth credentials are loaded from .env or .env.local files
# See .env.example for required variables

.PHONY: all build build-linux build-dev dev generate clean test lint lint-go lint-frontend fmt help \
        install uninstall install-linux uninstall-linux frontend-deps frontend-update frontend-build

# Load environment variables from .env files.
# .env.local overrides .env. All OAuth credentials live in the root .env —
# extension packages no longer carry their own OAuth client vars.
-include .env
-include .env.local
export

# Go module path
MODULE := github.com/hkdb/aerion

# Build flags for injecting OAuth credentials at compile time.
#
#   GOOGLE_CLIENT_ID/SECRET   — mail's Google-verified client. Also backs
#                               first-party extensions for any scopes their
#                               manifest declares in
#                               first_party_uses_core_for_scopes (today:
#                               contacts.readonly). Surfaced as
#                               "Aerion - Google" in the picker.
#   MICROSOFT_CLIENT_ID       — mail's Azure AD app registration. Also
#                               backs microsoft-contacts and
#                               microsoft-calendar (Microsoft Graph
#                               doesn't gate scopes behind verification).
#                               Surfaced as "Aerion - Microsoft".
#   GOOGLE_TESTING_CLIENT_ID/SECRET — shared un-Google-verified test
#                               project for extensions that need broader
#                               scopes than the mail project carries
#                               (contacts.readwrite, full Calendar).
#                               Single client backs google-contacts AND
#                               google-calendar slots. Surfaced as
#                               "Aerion - Google (Testing)".
LDFLAGS := -X '$(MODULE)/internal/oauth2.GoogleClientID=$(GOOGLE_CLIENT_ID)' \
           -X '$(MODULE)/internal/oauth2.GoogleClientSecret=$(GOOGLE_CLIENT_SECRET)' \
           -X '$(MODULE)/internal/oauth2.MicrosoftClientID=$(MICROSOFT_CLIENT_ID)' \
           -X '$(MODULE)/internal/oauth2.GoogleTestingClientID=$(GOOGLE_TESTING_CLIENT_ID)' \
           -X '$(MODULE)/internal/oauth2.GoogleTestingClientSecret=$(GOOGLE_TESTING_CLIENT_SECRET)'

WAILS3_VERSION := v3.2.0-nightly.20261123
WAILS3 ?= go run github.com/wailsapp/wails/v3/cmd/wails3@$(WAILS3_VERSION)
PREFIX ?= /usr/local
DESTDIR ?=

all: build

build: frontend-build
	@mkdir -p build/bin
	@go build -tags production -ldflags "$(LDFLAGS)" -o build/bin/aerion .

build-linux: build

dev: frontend-deps
	$(WAILS3) dev -config build/config.yml -port 5173

build-dev: generate
	@mkdir -p build/bin frontend/dist
	@touch frontend/dist/.keep
	@go build -tags dev -ldflags "$(LDFLAGS)" -o build/bin/aerion-dev .

generate:
	$(WAILS3) generate bindings -ts -names -d frontend/bindings

frontend-build: frontend-deps generate
	cd frontend && npm run build

frontend-deps:
	@if [ ! -d frontend/node_modules ]; then cd frontend && npm ci; fi

frontend-update:
	cd frontend && npm install

test: frontend-build
	go test ./...

lint: lint-go lint-frontend

lint-go:
	go vet ./...

lint-frontend:
	cd frontend && npm run lint

fmt:
	gofmt -w $$(git ls-files '*.go')

clean:
	rm -rf build/bin frontend/dist

install: install-linux

uninstall: uninstall-linux

## Linux Installation

# hicolor icon sizes shipped on Linux (#395). Keep in sync with
# build/linux/install.sh ICON_SIZES for native installations.
ICON_SIZES ?= 32 48 64 128 256

# Install Aerion on Linux
install-linux: build
	@echo "Installing Aerion to $(DESTDIR)$(PREFIX)..."
	install -Dm755 build/bin/aerion "$(DESTDIR)$(PREFIX)/bin/aerion"
	@for sz in $(ICON_SIZES); do \
		install -Dm644 "build/linux/icons/$${sz}x$${sz}/io.github.hkdb.Aerion.png" \
			"$(DESTDIR)$(PREFIX)/share/icons/hicolor/$${sz}x$${sz}/apps/io.github.hkdb.Aerion.png"; \
	done
	install -Dm644 build/linux/icons/scalable/io.github.hkdb.Aerion.svg "$(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/io.github.hkdb.Aerion.svg"
	install -Dm644 build/linux/aerion.desktop "$(DESTDIR)$(PREFIX)/share/applications/io.github.hkdb.Aerion.desktop"
	@echo "Updating icon cache..."
	-gtk-update-icon-cache -f -t "$(DESTDIR)$(PREFIX)/share/icons/hicolor" 2>/dev/null || true
	@echo ""
	@echo "Installation complete!"
	@echo "You may need to log out and back in for the application to appear in your menu."
	@echo ""
	@echo "To set Aerion as your default email client:"
	@echo "  xdg-mime default io.github.hkdb.Aerion.desktop x-scheme-handler/mailto"

# Uninstall Aerion from Linux
uninstall-linux:
	@echo "Uninstalling Aerion from $(DESTDIR)$(PREFIX)..."
	rm -f "$(DESTDIR)$(PREFIX)/bin/aerion"
	@for sz in $(ICON_SIZES); do \
		rm -f "$(DESTDIR)$(PREFIX)/share/icons/hicolor/$${sz}x$${sz}/apps/io.github.hkdb.Aerion.png"; \
	done
	rm -f "$(DESTDIR)$(PREFIX)/share/icons/hicolor/scalable/apps/io.github.hkdb.Aerion.svg"
	rm -f "$(DESTDIR)$(PREFIX)/share/icons/hicolor/256x256/apps/aerion.png"  # Remove old name if it exists
	rm -f "$(DESTDIR)$(PREFIX)/share/applications/io.github.hkdb.Aerion.desktop"
	rm -f "$(DESTDIR)$(PREFIX)/share/applications/aerion.desktop"  # Remove old name if it exists
	-gtk-update-icon-cache -f -t "$(DESTDIR)$(PREFIX)/share/icons/hicolor" 2>/dev/null || true
	@echo "Uninstallation complete!"

help:
	@echo "make dev        Start Linux development with Vite and Wails"
	@echo "make build      Build the native executable at build/bin/aerion"
	@echo "make test       Build frontend assets and run Go tests"
	@echo "make generate   Regenerate the Wails TypeScript bindings"
	@echo "make install    Install the Linux executable, desktop entry and icons"
	@echo "make uninstall  Remove the Linux installation"

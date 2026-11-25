# Extension development rules

Use the [architecture overview](ARCHITECTURE.md) for the application boundary and the [extension reference](EXTENSIONS.md) for lifecycle, paths and API surfaces.

## Backend boundary and data

- Route new host dependencies through `coreapi.Core` or the shared `internal/kit` utilities. Introduce shared contract methods for concrete consumers. Keep extension-only features on the extension bridge.
- Use `Core.Extension(id)` for published cross-extension interfaces and host APIs for shared data. Keep feature-specific logic in its extension. Existing bridges depend on host types for setup, and Contacts integrates with the core contact and CardDAV stores. Keep those dependencies localized.
- Keep extension-owned tables and migrations in each extension's store. Use the host's namespaced credential and OAuth surfaces. Match existing provider config IDs such as `google-calendar` and `microsoft-contacts`.
- Keep startup registration descriptive. Gate feature operations by enablement and initialize their stores and services when needed. Preserve explicit setup and read-only integration paths that are available while the feature is disabled.

## Wails and Svelte

- Keep host wiring in `app/extension_<name>.go` and bridge methods in the extension's `backend/bridge.go`. Use a unique `<Name>Bridge` type and `<Name>_<Method>` names, since Wails binds the promoted methods on `App`.
- Keep the extension UI under `extensions/<name>/frontend/`. Reuse shared components and semantic Carbon colors, and preserve the keyboard and dialog behavior of the host. [Frontend guide](../frontend/README.md) · [Frontend instructions](../frontend/AGENTS.md)
- Include English and Russian changes together. Regenerate bindings with `make generate` after bound Go API edits. Check schema changes against existing profile data and document confirmed migration behavior. [Translation guide](LANGUAGE.md) · [Build and validation](BUILD.md)

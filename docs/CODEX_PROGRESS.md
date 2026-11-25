# Codex progress

Updated 2026-11-25.

- Milo is hosted at [pavlith/milo](https://github.com/pavlith/milo). Development uses `dev`, and `main` holds stable code. [Branch workflow](../CONTRIBUTING.md#repository-branches)
- The Linux Wails 3 and Svelte UI migrations, Carbon rebrand and cold `mailto:` fix passed their local validation. The prior checks and their scope are recorded in the [migration validation record](history/MIGRATION_VALIDATION.md).
- Consolidated the README, documentation index, architecture, build and release guides, frontend guide and extension references against `dev`. Completed migration documents, upstream credits, the Aerion rollback guide and CASA records are in [history](README.md#historical-documentation).
- Verified repository-relative Markdown targets and heading anchors, checked the issue form YAML, and matched the documented build commands to the Makefile and Linux CI. This stage used documentation checks only.
- The GitHub API confirmed private vulnerability reporting is enabled. The security policy now links directly to the GitHub reporting form. [Security reporting](../SECURITY.md)
- Updated the English and Russian first-run and About notices to link to the owner-approved Milo terms and privacy notice. Both URLs resolve on `main`, which still serves the Aerion versions. Promote the documentation to `main` so those URLs serve the Milo versions. [In-app notices](TERMS.md#in-app-notices)
- `npm run check`, `npm run lint` and `git diff --check` passed. Native dialog behavior was reviewed in source.

Use the [code map](CODEX_MAP.md) to locate the current implementation and [documentation index](README.md) for usage and development guidance.

# Release Steps

Prepare and validate releases in `dev`; use only `dev` and `main` as described in [Repository Branches](../CONTRIBUTING.md#repository-branches). Update the following files in `dev`:

1. `app/state.go` - Go app version
2. `frontend/package.json` - npm package version
3. `frontend/package-lock.json` - auto-updates with npm install
4. `build/flatpak/io.github.hkdb.Aerion.metainfo.xml` - Flatpak version
5. `CHANGELOG.md` - add new release entry
6. `wails.json` - product version

After validation and explicit release approval, merge any newer `main` commits into `dev`, then promote `dev` to `main` through a pull request that preserves commit ancestry. Tag the approved commit on `main` with `v*` to trigger `.github/workflows/release.yml`; do not create a release branch. Pushing a tag publishes release artifacts and requires authorization.

The release workflow commits the generated Flathub manifest directly to `main`. Merge that commit back into `dev` before further release work so the two branches retain the same release metadata. CI runs on pushes to both branches and on pull requests; a green CI run does not replace manual/native validation.

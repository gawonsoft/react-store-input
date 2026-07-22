# Publishing checklist

This repository publishes from the existing GitHub Actions workflow. Do not
run `npm publish` locally unless the release process is intentionally changed.

## Prepare a release

1. Choose the next version using Semantic Versioning.
2. Move relevant entries from `Unreleased` in `CHANGELOG.md` into a dated
   version section.
3. Update `version` in `package.json` and `package-lock.json` together with
   `npm version --no-git-tag-version <version>`.
4. Run the complete verification suite:

   ```sh
   npm ci
   npm run check
   npm pack --dry-run
   ```

5. Inspect the dry-run file list. It should contain only package metadata,
   documentation, the license, and files under `dist/`.
6. Commit the version and changelog changes, then review CI before merging.

## Existing automation

The current publish workflow runs on changes to `package.json` or
`package-lock.json` on `main`. It installs dependencies, runs the test suite,
checks whether the package version is new, and publishes only a new version.

This document describes that workflow but does not modify or invoke it.

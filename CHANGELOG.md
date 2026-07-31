# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-07-31

### Changed

- Renamed `useStoreComponent` to `useStoreInput`. It accepts an existing
  `gw-store` `Store` and returns bound `input`, `select`, and `textarea`
  components.
- Renamed the low-level DOM binding hook from `useStoreInput` to
  `useStoreHTMLElement`.
- Removed `gw-store` API re-exports. Import stores, selectors, and their types
  directly from `gw-store`.

### Removed

- Removed the deprecated `useFormStore`, `FormStore`, and `FormComponents`
  APIs.

## [0.4.0] - 2026-07-22

### Added

- Typed `Lens`, `Codec`, and `InputBinding` primitives for custom controls.
- `stateLens` for generating a getter and setter from one typed state path.
- `gw-result@0.3.0`-based codec parsing with typed failure metadata from
  `useStoreInput`.
- `assertLensLaws` and `assertCodecLaws` helpers for testing mapping and
  round-trip invariants.
- Top-level `ok`, `err`, and `Result` re-exports for codec implementations.

### Changed

- Removed the deprecated `getter`, `setter`, `toInputValue`, and
  `toStateValue` APIs. Nested and converted controls now use bindings.
- Reimplemented named controls internally with a generated Lens and default
  Codec while preserving built-in conversion and reset behavior.
- Expanded the custom currency example to demonstrate validation failures and
  accessible error feedback.

### Fixed

- Preserved invalid raw control input while unrelated store fields update.
- Cleared binding parse errors and restored the initial domain value on native
  form reset.

## [0.3.0] - 2026-07-22

### Added

- Standalone `Input`, `Select`, and `Textarea` components with typed named or
  custom getter/setter bindings.
- `useStoreInput`, `useStoreController`, `createRender`, and complete
  `gw-store` API re-exports.
- An optional `react-store-input/text-editor` entry point that keeps editor
  dependencies out of the core bundle.
- Automatic native form reset synchronization, including batched store
  notifications and multiple-select, date, checkbox, radio, and file values.
- Runtime, package-consumer, type, and example build tests.
- A complete interactive example covering the public components, hooks, and
  supported input value types.

### Changed

- Updated the store integration to use exactly `gw-store@0.2.0`.
- Published separate CommonJS and ESM entry points with matching declaration
  files.
- Made `gw-react-text-editor` an optional peer dependency.
- Expanded React peer support to React 18 and 19.
- Organized package source, examples, styles, and runtime tests by
  responsibility.

### Fixed

- Prevented bundled duplicate React copies from causing invalid hook calls.
- Preserved numeric radio values and mapped empty numeric inputs to
  `undefined`.
- Stored all selected values from multiple selects and normalized empty file
  inputs to `null`.
- Kept rendered JSON synchronized after a native form reset.
- Reduced reset notifications to one batch and eliminated notifications for
  semantically unchanged arrays and `Date` values.

## [0.2.6] - 2026-04-28

### Added

- Re-exported the `gw-store` API.

## [0.2.5] - 2026-04-27

### Changed

- Added `gw-store` as a package dependency.

## [0.2.4] - 2026-03-16

### Fixed

- Improved store value comparison behavior.

## [0.2.3] - 2026-03-09

### Changed

- Applied package maintenance updates.

## [0.2.2] - 2026-03-09

### Changed

- Added compatible React 18 type and peer dependency ranges.

## [0.2.1] - 2026-01-21

### Changed

- Updated the JSX runtime configuration.

## [0.2.0] - 2026-01-13

### Fixed

- Corrected forwarded ref behavior.

# Changelog

All notable changes to `@onesmall/ui` are documented here. This project follows
[Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [0.1.0] - 2026-10-11

First release on npm under the `@onesmall/ui` name. (The library was developed internally as `onesmallui`,
last at 0.2.0; that name was never published.)

### Added

- 55+ React components, hooks, SCSS sources, design tokens, utilities and a vanilla `@onesmall/ui/dom` layer.
- Builds for ESM (`import`) and CommonJS (`require`), bundled TypeScript declarations for both, and one CSS
  file (`@onesmall/ui/styles.css`, plus `styles.min.css`).
- Light and dark themes with WCAG AAA contrast on every token pair.
- Forced-colors (Windows High Contrast) support for states shown by fills.
- ESLint (jsx-a11y strict, react-hooks), an axe test for every component, and CI.

### Changed

- Radio groups use `role="radiogroup"` and carry `aria-invalid` / `aria-required` (radios themselves don't
  support `aria-invalid`); the DatePicker's button trigger no longer sets `aria-invalid`, which buttons don't
  support (the error stays linked through `aria-describedby`).
- `TooltipProvider` only exposes its tooltip role while a tooltip has text.

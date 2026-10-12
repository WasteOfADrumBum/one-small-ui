# Changelog

All notable changes to `@onesmall/ui` are documented here. This project follows
[Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [0.2.0] - 2026-10-11

### Added

- Accessibility primitives: `useFocusTrap`, `useFocusReturn`, `useScrollLock`, `useReducedMotion`,
  `useAnnouncer` with `AnnouncerProvider` and `LiveRegion`, `Portal`, and `getFocusableElements`. All are SSR safe.
- `SkipLink` accepts `href` (`<SkipLink href="#main">`) and moves focus to its target without changing the
  URL hash. `targetId` still works.
- Icon system: an `Icon` base, `createIcon`, and 41 tree-shakable icons (`ChevronDownIcon`, `CloseIcon`, …),
  sized `sm | md | lg` (`--os-icon-*`) or by number, decorative unless given a `label`. Exported from the
  root and from the new `@onesmall/ui/icons` entry point.
- `Transition` and `useTransition`: presets `fade`, `scale`, `slide-up`, `slide-down`, `slide-left`,
  `slide-right` and `collapse`, `appear`, `unmountOnExit`, custom classes, and enter/exit callbacks that
  still fire under reduced motion.
- Motion tokens in `tokens/themes.json` (durations `fast | base | slow`, easings `standard | enter | exit`),
  generated into SCSS and a `motion` export.
- `Collapse` takes `onEntered` and `onExited`; `ToastOptions` takes `announcement`; `Toast` takes `live`.

### Changed

- One `data-state` vocabulary across the library: `opening → open → closing → closed`. Dialog, Drawer,
  Modal, Popover, Tooltip, Toast and Collapse share the `Transition` engine. Overlays show `opening` as `open`.
- Popover and Tooltip play a short exit animation instead of disappearing at once.
- Modal dialogs and drawers keep Tab and Shift+Tab inside, also where `showModal()` isn't available.
- Existing components use the new icons instead of inline SVGs.
- `usePrefersReducedMotion` is deprecated in favour of `useReducedMotion`.

### Behavior changes

1. **Toasts are announced through the announcer.** `ToastProvider` reads each toast out through
   `useAnnouncer` (`danger` assertively, the rest politely), mounting its own announcer when there is no
   `AnnouncerProvider`. Its `<li>` toasts no longer carry `role="status"` / `role="alert"`. A standalone
   `<Toast>` keeps its role.
2. **`tokens.json` has a `"motion"` key.** It sits next to `"light"` and `"dark"`. Code that treats every
   top-level key of `@onesmall/ui/tokens.json` as a theme should skip it. The `themes` export is unchanged.
3. **Icons inside components were redrawn.** Glyphs look slightly different (round joins everywhere). The
   Field error and danger Alert icons are now a circled ×.
4. **Scroll lock pads the page.** While locked, `<body>` is padded by the scrollbar width (none when there is
   no scrollbar), exposed as `--os-scrollbar-width` on `<html>`. Fixed navbars, `.os-fixed-top/bottom` and the
   toast viewport shift by the same amount, so nothing jumps.

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

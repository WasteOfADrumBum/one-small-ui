# Changelog

All notable changes to `@onesmall/ui` are documented here. This project follows
[Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

### Deprecated

- `ChipInput` will be removed in 1.0.0. It now logs a one-time `console.warn` in development builds
  (nothing in production) pointing to `TagInput`.

## [0.3.0] - 2026-10-13

### Added

- `DataTable`, built on `Table` with native table semantics. It has column definitions (accessor or `cell`,
  `sortable`, `align`, `width`, `hideable`, `filterable`), header sort buttons with `aria-sort` and optional
  `multiSort`, and global and per-column filters. It also has `Pagination` with a page size selector,
  checkbox selection with an indeterminate select all, a Columns menu, `stickyHeader`, a keyboard-scrollable
  region, `density`, Skeleton loading rows and an empty-state slot. `manual` mode hands sorting, filtering
  and paging to callbacks for server data. Sort, result and selection changes are announced. `name` submits
  the selected row ids.
- `NumberInput`, a `role="spinbutton"` text input with `inputmode="decimal"`. Arrow keys step, Page Up/Down
  take `largeStep` and Home/End jump to the bounds. It clamps and rounds to `precision` on blur, not while
  typing. It formats with `Intl.NumberFormat` (currency, percent, units) and takes start and end adornments.
  Its stepper buttons stay out of the tab order and repeat while held, and the wheel only steps with
  `allowWheel`.
- `TagInput`, which takes free entry or `mode="suggestions-only"` (a Combobox-style listbox). It has
  configurable `delimiters` and paste splitting, case-insensitive `dedupe`, `maxTags` and `validate`.
  Remove buttons are named "Remove tag: X", adds, removes and the tag limit are announced, and each value
  submits as its own hidden input.
- `TimePicker`, a combobox with a listbox of times every `step` minutes (default 15). It shows 12 or 24 hour
  time from the locale or `hourCycle` and parses flexible input (`9`, `930`, `9:30p`, `21:30`). It takes
  `min`, `max` and `isTimeDisabled`, and its value is always an `"HH:mm"` string. The helpers `parseTime`,
  `formatTime`, `timeToMinutes`, `minutesToTime`, `getTimeOptions` and `getHourCycle` are exported for
  pairing with `DatePicker`.
- `Table` takes `stickyHeader` and `density` (`compact | default | comfortable`).
- `npm run test:layout`: Playwright layout checks (Avatar squares, DataTable sticky header) against fixtures in
  `test/layout`.

### Fixes

- **Avatar images render as ovals.** The avatar was an `inline-grid` whose auto row grew to the image's
  intrinsic height. `height: 100%` resolved against that row, so portrait and large images became tall
  ovals that spilled out of the square. The avatar is now an exact square for each size token. The image or
  initials sit inside a new clipping `.os-avatar__frame`, the image is absolutely positioned with
  `object-fit: cover`, and the status dot stays outside the clip. A broken image falls back to initials and
  tries again when `src` changes.
- Docs: the Avatar page no longer loads an external image (its only console error), and the sticky header
  is opaque at every width, so text scrolled under it can't lower its contrast.

### Deprecated

- `ChipInput` in favour of `TagInput`. Its behaviour is unchanged.

### Behavior changes

1. **Avatar markup.** The image and initials now sit inside `.os-avatar__frame`. CSS that targets
   `.os-avatar > img` or `.os-avatar > .os-avatar__initials` must select through the frame. Props are
   unchanged.

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

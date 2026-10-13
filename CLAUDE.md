# OneSmallUI: notes for Claude sessions

Read CONTRIBUTING.md first; it holds the component, SCSS, docs and check conventions. This file adds the
rules for the accessibility hooks, icons, Transition and motion tokens added in 0.2.0.

## Accessibility hooks (`packages/onesmallui/src/hooks`)

- Overlays and anything modal compose these hooks. Don't re-implement them inside a component.
  - `useFocusTrap(ref, { active, initialFocus, returnFocus })`: wraps Tab and Shift+Tab inside `ref`. It
    moves focus itself on every Tab, using `getFocusableElements` (`utils/focusable.ts`), so hidden, inert and
    disabled elements are always skipped. Nested traps rank by DOM containment: the inner trap wins.
  - `useFocusReturn({ active, target, fallback, container, restoreOnDeactivate })`: saves the focused element
    on activate and restores it on deactivate, only when focus was lost or is still inside `container`.
    Declare it before the effect that moves focus in. Pass `restoreOnDeactivate: false` and call `restore()`
    yourself when only some close paths should return focus (Popover).
  - `useScrollLock(active)`: counted, so locks nest. It pads `<body>` by the scrollbar width and sets
    `--os-scrollbar-width` on `<html>` plus the `os-scroll-locked` class (the vanilla `dom` layer uses that
    class too). Fixed-position UI must offset by `var(--os-scrollbar-width, 0px)` under
    `html.os-scroll-locked`; see `scss/components/_overlay.scss`.
  - `useReducedMotion()`: built on `useMediaQuery`. `usePrefersReducedMotion` is a deprecated alias.
  - `useAnnouncer()` / `AnnouncerProvider` / `LiveRegion`: announce status changes with `announce(msg, { politeness })`;
    use `assertive` for errors only. Outside a provider it falls back to a shared region on `<body>`.
    `ToastProvider` mounts its own provider when none is above it.
- SSR: no `window` or `document` at module scope or during render, only in effects and event handlers.
  `test/ssr.test.tsx` renders everything in a Node environment; add new hooks and components to it.

## Icons (`packages/onesmallui/src/icons`)

- One file per icon, `<Name>Icon.tsx`, built with `createIcon('<Name>', paths)`. Export it from
  `icons/index.ts` alphabetically. Names always end in `Icon`, so they never collide with components.
- Artwork: 24×24 viewBox, stroke only (`currentColor`, width 2, round caps and joins), strokes kept inside
  2–22. Mirror directional pairs exactly. Draw originals; don't copy path data from icon sets.
- Decorative by default (`aria-hidden="true"`, `focusable="false"`). Pass `label` only when the icon carries
  meaning on its own, which gives `role="img"` and an accessible name. Icon-only buttons put the name on the
  button (`aria-label`), not on the icon.
- Sizes: `sm | md | lg` map to `--os-icon-sm/md/lg`; a number sets px. Component SCSS sizes inner icons with
  descendant selectors (`.os-close-btn svg`), which outrank `.os-icon`, so keep `@use 'icon'` first in
  `scss/components/_index.scss`.
- Inside components, import from `'../icons/<Name>Icon'`, not the barrel. Consumers can use
  `@onesmall/ui/icons` or the root.

## Transition and data-state

- One vocabulary everywhere: `data-state="opening | open | closing | closed"`. `useTransition(show, options)`
  is the engine. `<Transition>` puts the state on its single child, with `data-enter`/`data-leave` presets and
  `--os-transition-duration`.
- Dialog, Drawer, Modal (through `DialogBase`), Toast, Popover, Tooltip and Collapse all run on
  `useTransition`. Components whose CSS animates on mount show `opening` as `open`. Never add a new state
  name; write new animated components on `useTransition`.
- Reduced motion (or `data-os-motion="off"` on `<html>`) makes the duration 0, and callbacks still fire.
- The presets live in `scss/components/_transition.scss`: each sets `--_from` / `--_to` for the shared
  keyframes. `collapse` measures height in JS.

## Motion tokens

- The single token file is `packages/onesmallui/tokens/themes.json` (published as `@onesmall/ui/tokens.json`).
  Theme palettes are its top-level keys, and `motion` is a reserved non-theme key with `duration` (ms:
  fast, base, slow) and `easing` (standard, enter, exit).
- Read it only through `scripts/tokens-lib.mjs` (`readTokens()` / `splitTokens()`), which drops reserved
  keys from the themes. `build-tokens.mjs` generates `scss/abstracts/_themes.scss`, `_motion.scss` and
  `src/tokens.ts` (`themes`, `motion`). `check-contrast.mjs` checks themes only. `test/tokens.test.tsx`
  guards this.
- In SCSS use `dur('fast'|'base'|'slow'|'slower')` and `ease('standard'|'enter'|'exit'|'emphasized')`. In TS,
  use `motion.duration.*`. Never hardcode durations.

## Form controls and data (0.3.0)

- New form controls follow the existing pattern: `useControllableState`, `useFieldControl` for Field wiring,
  `name` submits through hidden inputs (disabled controls submit nothing), `size?: ExtendedSize`, and
  `invalid` / `readOnly` / `disabled`. Announce status changes with `useAnnouncer`, never a private live region.
- Popups anchored to an input (TimePicker, TagInput suggestions) follow Combobox: `role="combobox"` on the
  input, `aria-activedescendant`, and the list in the top layer via `useFloating` + `showInTopLayer()`, not
  `Portal`. TagInput reuses the `.os-combobox__*` option styles.
- Time values are always `"HH:mm"` 24-hour strings, whatever the display. Use the helpers in
  `TimePicker.tsx` (`parseTime`, `formatTime`, `getTimeOptions`, …) rather than parsing times again. Pass
  `locale` when server rendering anything locale-formatted, or server and client can disagree.
- `ChipInput` is deprecated: new work uses `TagInput`. `chipKeyNav` in `Chip.tsx` is internal, so the barrel
  exports Chip by name.
- DataTable keeps native `<table>` semantics (not ARIA grid). Its `disabled` / `readOnly` / `invalid` / `name`
  apply to row selection.
- Physical sizes in new SCSS and inline styles are logical (`inline-size`, `block-size`,
  `max-block-size`).
- Layout that jsdom can't measure goes in `npm run test:layout`: add a fixture to
  `packages/onesmallui/test/layout/fixtures.tsx` and its checks to `scripts/layout-test.mjs`. CI runs it and
  `test:a11y` as the `Playwright (layout)` and `Playwright (a11y)` jobs; a failure uploads `playwright-report/`.
- The avatar is an exact square (`inline-size` = `block-size` = `--_size`). The image and initials sit in
  `.os-avatar__frame`, which clips, and the status dot is outside the frame.

## Navigation (0.4.0)

- Shortcuts go through `utils/hotkeys.ts` (`parseHotkey`, `matchesHotkey`, `formatHotkey`, `isApplePlatform`,
  `isEditableTarget`); don't parse key combos again. `Mod` is ⌘ on Apple platforms and Ctrl elsewhere.
  Global shortcuts use `useHotkeys`, which skips text fields and IME composition unless `allowInInputs`.
- Show shortcuts with `<Kbd combo="Mod+K" />`. It renders the non-Apple form on the server and corrects it
  after hydration (`useHotkeyPlatform`, `useSyncExternalStore`), and spells the combo out for screen readers.
  Menu `shortcut` stays a `ReactNode` rendered `aria-hidden`, so a Kbd or a string both work there.
- Items that navigate (SidebarItem, CommandPalette items, TreeView nodes) take `href` plus `as` (an element
  type such as Next.js `Link`) or `render`. New navigating items follow the same shape.
- `Sidebar` renders through `Drawer` below `drawerBelow`, so it gets the overlay hooks for free; don't add a
  second focus trap. `SidebarProvider` / `useSidebar()` let a `SidebarToggle` live outside the sidebar.
  `Tooltip describe={false}` is for triggers whose accessible name already says the tooltip text (rail items).
- `CommandPalette` runs on `Dialog` and follows the Combobox pattern (`role="combobox"`,
  `aria-activedescendant`, grouped listbox). Search goes through `utils/fuzzy.ts` (`fuzzyMatch`,
  `fuzzyFilter`). Highlights are `<mark>`, and the option's name comes from `aria-label` so it is read as one
  word. The docs header dogfoods it (`apps/docs/src/App.tsx`, Mod+K).
- `Menu` and `ContextMenu` share their state machine through `components/MenuBase.tsx` (`useMenuRoot`,
  `MenuContext`), which is internal and not exported from the barrel. ContextMenu anchors to a virtual rect
  with `useFloating`'s `setAnchor` and reuses Menu's items; never add a parallel item family.
- `TreeView` keeps native list semantics with ARIA tree roles (`ul role="tree"`, `li role="treeitem"`,
  `ul role="group"`); `eslint.config.js` allows those roles on `ul`/`li`. Rows are memoized and subscribe to
  their own state, so a focus move re-renders two rows. Don't virtualize it (that breaks `aria-setsize` and
  reading order). With `checkboxes`, leaf keys are the source of truth and parents derive `mixed`.
- Docs pages can set `callout` (`apps/docs/src/site/docTypes.ts`) for a warning the page leads with, as
  ContextMenu does for "always provide another path".

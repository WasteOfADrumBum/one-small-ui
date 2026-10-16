# Changelog

All notable changes to `@onesmall/ui` are documented here. This project follows
[Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

## [0.5.0] - 2026-10-16

### Added

- `Rating`, a star rating on visually hidden native radios in a `<fieldset>` (`role="radiogroup"`), so arrow
  keys, `Field`, `Form`, required validation and native submission work as they do for radios. `precision` is
  `1` or `0.5`, `max` defaults to 5, and each option is named "3 stars" / "3.5 stars" (`getLabel` to
  translate). Hovering or focusing an option previews it (`data-preview`) without changing the value.
  `allowClear` clears the rating when the current value is chosen again (click, or Space on the checked
  option) and announces "Rating cleared" through `useAnnouncer`. `readOnly` renders one `role="img"` named
  "4.5 out of 5 stars" (`getValueText`) with no inputs. It takes an `icon` (default `StarIcon`), `size` and
  `color`; chosen steps are filled and empty ones outlined, so the value never relies on color, and half fills
  use a logical clip that mirrors in RTL. `npm run test:layout` checks the half fill and hit areas in LTR and
  RTL.
- `Timeline` and `TimelineItem`, events in order on an `<ol>`. Each item has a marker (status icon, any
  icon or an `Avatar`), title, `<time dateTime>` (from a `Date` or ISO string; date-only strings stay on
  their calendar day in every time zone), description, extra content and actions. `status` (`success`,
  `warning`, `danger`, `info`, `pending`) shows its own icon plus a visually hidden prefix ("Success:"), so
  color is never the only cue; `statusLabels` translates it. Layouts are `vertical`, `alternating` (both
  sides of a centered line from a 36rem container width, mirrored in RTL) and `horizontal` (scrolls inline
  and becomes a focusable, named region when it overflows). `pageSize` adds "Show more", which reveals the
  next batch, focuses its first event and announces "5 more events shown" through `useAnnouncer`; the
  visible count can be controlled. `variant="feed"` is for activity logs: avatar, actor, action and an
  `Intl.RelativeTimeFormat` time with the full date in a `Tooltip`. The server renders absolute dates and the
  relative text switches in after hydration (or right away with `now`), kept current by one shared clock.
- `npm run test:layout` checks that a horizontal Timeline scrolls inside itself at 360px without page
  overflow, and that the alternating layout mirrors in RTL and falls back to one side when narrow.
- `Popconfirm`, a small confirmation anchored to its trigger, built on `Popover` (so `useFloating`, the top
  layer and the shared transition come with it). It is a `role="alertdialog"` labelled by `title` and described
  by `message`, with Cancel and Confirm buttons (`cancelLabel`, `confirmLabel`) and focus on Cancel when it
  opens (`initialFocus="confirm"` to change that). Escape, Cancel and an outside click call `onCancel` and return
  focus to the trigger, except when the click lands on another control, which keeps focus. `onConfirm` may
  return a promise: Confirm shows `loading` and the popover stays open until it settles, and a rejection shows
  the error inline (`role="alert"`, the error's message or `errorText`) for a retry. `variant="danger"` makes
  Confirm red and adds a `WarningIcon`, so danger is not shown by color alone. `open` can be controlled. The docs
  say to use a `Dialog` for irreversible or high-impact actions, and `npm run test:layout` checks it stays inside
  the viewport at every edge and corner, at 360px and on desktop.
- `Popover` takes `role` (`'dialog'` by default, or `'alertdialog'`), `aria-describedby`, `initialFocus` (a ref
  focused when it opens) and `returnFocusOnDismiss` (default `false`), which also returns focus to the trigger
  after an outside click on something that cannot take focus. Without them it renders and behaves as before.
- `Lightbox`, a full-screen image viewer on `Dialog` (named "Image viewer" by default and described by its
  counter). It has previous/next buttons, Left/Right arrows (swapped in RTL), Home/End and Escape, swipe to
  navigate, pinch zoom, double tap to toggle 2×, `+` / `-` / `0` to zoom and reset, and drag or arrow keys to pan
  while zoomed (the arrows navigate only when not zoomed). Zoom clamps to 1×–`maxZoom` (default 4) and panning
  stops at the image edges. `alt` is required on every `LightboxImage` by the types (an empty one warns once in
  development), and an optional `caption` is a `<figcaption>` linked with `aria-describedby`. The "3 of 12"
  counter is visible and announced through `useAnnouncer` when it changes, as are zoom changes. It preloads the
  neighboring images, passes `srcSet` and `sizes` through, shows a `Spinner` while loading and an `ImageOffIcon`
  with the alt text when an image fails, and has an optional `thumbnails` strip (`aria-current`) and a per-image
  `download` link. `open` and `index` can be controlled or uncontrolled, and `loop` wraps past the ends.
- `LightboxGallery`, a responsive grid of thumbnail buttons ("Open <alt>") wired to a Lightbox; closing returns
  focus to the thumbnail that opened it.
- `useSwipe(ref, { onSwipe, threshold, enabled, axis, mouse })`, pointer-event swipes reported in logical
  directions (`'start' | 'end' | 'up' | 'down'`, RTL-aware). It ignores multi-touch (pinch), and mouse drags
  unless `mouse`. Carousel's fade-mode swipe now runs on it.
- Icons: `ZoomInIcon`, `ZoomOutIcon` and `ImageOffIcon`.
- `npm run test:layout` checks the Lightbox at 360px and desktop widths, in LTR and RTL, with Chromium touch
  emulation: it fits the screen with 44px controls, and swipe, pinch, double tap, drag and keyboard zoom and pan
  all work.
- `EmptyState`, for when there is nothing to show. It has a decorative icon or `illustration` (`aria-hidden`), a
  `title` rendered as an h2 to h6 (`headingLevel`, default 2), a `description`, and `actions` and
  `secondaryActions` slots, in a `default` and a `compact` size. Presets `no-data`, `no-results`, `error` and
  `first-use` fill in the icon and copy; `onClearFilters` and `onRetry` add the no-results and error presets'
  buttons, and the error preset pairs `ErrorIcon` with its heading so it never relies on color. DataTable and
  CommandPalette now render a string (or default) `emptyState` as the heading of a compact EmptyState with the
  same text, cell and look; other nodes render as before. A failed CommandPalette `loadItems` shows the error
  preset with a Retry button (`labels.retry`). TreeView gets an opt-in `emptyState`, shown when `items` is empty,
  with the empty tree kept as the hidden ref target.
- Icons `InboxIcon`, `RefreshIcon` and `SparklesIcon`.

## [0.4.1] - 2026-10-16

### Changed

- `TreeView`: a failed lazy load no longer adds a tab stop. The error row's Retry button has `tabIndex={-1}` (it
  stays clickable for mouse and touch), Enter on the failed item retries (opening it first if it was closed), and
  the assertive failure announcement ends with "Press Enter to retry" (new `retryHint` label).

## [0.4.0] - 2026-10-13

### Added

- `Kbd`, a keyboard key or shortcut on the semantic `<kbd>` element. `combo="Mod+K"` shows ⌘K on Apple platforms
  and Ctrl K elsewhere (detected after hydration, so SSR markup matches), with the keys spelled out for screen
  readers ("Control K").
- `useHotkeys(combo, handler, { enabled, preventDefault, allowInInputs, target, event })`, with a
  platform-aware `Mod` key. It ignores text fields, selects, contenteditable and IME composition unless
  `allowInInputs`, and removes its listener on unmount.
- Hotkey helpers `parseHotkey`, `matchesHotkey`, `formatHotkey`, `isApplePlatform` and `isEditableTarget`.
- `CommandPalette`, a search-first command menu on `Dialog`, opened with `Mod+K` (configurable through
  `hotkey`, `false` turns it off). It is an ARIA 1.2 combobox with a grouped listbox and
  `aria-activedescendant`. Built-in fuzzy search matches labels and `keywords` and highlights matches in
  `<mark>` without splitting the option's accessible name. Item shortcuts show with `Kbd`. Items with
  `children` open nested pages with a breadcrumb; Backspace on an empty input or Escape goes back. It also has
  opt-in `recent` items in localStorage, `loadItems` async results with a debounce, `aria-busy` and aborted
  stale requests, and an empty state. Result counts are announced through `useAnnouncer` once typing settles.
  Open state and query can be controlled or uncontrolled, and link items take `href` plus `as` or `render`
  for router links such as Next.js `Link`. It goes full screen below `sm`. The docs site now uses it to search
  every page from the header.
- `fuzzyMatch(query, text)` and `fuzzyFilter(items, query, { getText, getKeywords })`, the dependency-free
  scorer behind CommandPalette. Word starts and consecutive runs score higher, and it returns the matched
  indices for highlighting.
- `npm run test:layout` checks that CommandPalette fits the viewport at 360px, 768px and desktop widths.
- `TreeView`, a hierarchical list on the WAI-ARIA tree view pattern (`ul role="tree"` → `li role="treeitem"` →
  `ul role="group"` with `aria-level`, `aria-setsize` and `aria-posinset`). It has roving focus, arrow keys
  (swapped in RTL), Home/End, `*` to open siblings and a 600ms typeahead. Selection is `none`, `single` or
  `multiple` (Shift + Arrow and Shift + click ranges, Ctrl/Cmd + A), and `checkboxes` adds tri-state
  checkboxes where leaf keys are the source of truth and parents report `mixed`. Expanded, selected and
  checked keys can be controlled. `loadChildren` loads children lazily, with `aria-busy`, a loading row, an
  error row with Retry and announcements through `useAnnouncer`. Nodes take an `icon`, and nodes with `href`
  render links that accept `as`/`render` (or the tree-wide `linkAs`) for router links such as Next.js `Link`.
  Rows are memoized and subscribe to their own state, so a focus move re-renders two rows even in trees with
  thousands of open nodes.
- `ContextMenu`, `ContextMenuTrigger` and `ContextMenuContent`: a menu that opens on right-click, Shift+F10, the
  Menu key or a touch long press (`longPressDelay`, 500ms by default, cancelled by moving, lifting or scrolling).
  It opens at the pointer, or at the focused element from the keyboard, through `useFloating` with a virtual
  anchor, and flips, shifts and caps its height so it stays inside the viewport. Items are Menu's own, so
  checkbox and radio items, groups, separators, submenus, typeahead and disabled items behave as they do in
  `Menu`. Escape and outside clicks return focus to the target. `disabled` attaches nothing, so the browser's
  menu shows. The docs say plainly that every action also needs a visible button, Menu or keyboard shortcut.
- `Sidebar`, app navigation in a `<nav>` landmark (`aria-label` or `aria-labelledby` is required by the
  types). It is expanded, collapsed to an icon rail, or a `Drawer` (`placement="start"`) below `drawerBelow`
  (default `lg`, `false` to disable), so the drawer gets the focus trap, scroll lock and focus return of the
  other overlays and closes when a link is followed. `collapsed` and `mobileOpen` are controllable, and the
  opt-in `persistKey` remembers the collapsed state in `localStorage` (read after mount, errors ignored). Its
  parts are `SidebarHeader`, `SidebarFooter`, `SidebarSection` (a real heading that names its list) and
  `SidebarItem`, which sets `aria-current="page"`, takes `icon`, `badge` and `disabled`, and renders your
  router's link through `as` or `render`. `SidebarGroup` is a disclosure button over `Collapse`; in the rail
  it expands the sidebar and opens the group. Rail items keep their names and show labels in a tooltip on
  hover and focus, mirrored in RTL. `SidebarToggle` sets `aria-expanded` and `aria-controls` and names the
  action; with `SidebarProvider` and `useSidebar()` it can live outside the sidebar, for example in a
  `Navbar`. Widths come from `--os-sidebar-width` and `--os-sidebar-rail-width`, animated with the motion
  tokens.
- `Tooltip` `describe={false}`: a visual-only tooltip for a trigger whose accessible name already says the
  same text. It adds no `aria-describedby` and is hidden from assistive tech. The default is unchanged.

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

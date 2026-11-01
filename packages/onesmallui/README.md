# @onesmall/ui

**[ui.onesmall.company](https://ui.onesmall.company)** · [Docs and live examples](https://one-small-ui.vercel.app) · [GitHub](https://github.com/WasteOfADrumBum/one-small-ui)

OneSmallUI (1SmUI): a futuristic, accessible component library for React, written in TypeScript and styled with SCSS.

- **Light and dark themes** driven by CSS variables, following the OS or the user
- **AAA contrast** on every token pair, enforced by a build check
- **Accessible by default**: built to WCAG 2.2 AA (AAA where measured, such as contrast), keyboard support, visible focus, 44px targets on controls (see [Accessibility](#accessibility) for the exceptions), reduced motion and forced-colors (High Contrast) support
- **SCSS variables** you can override with `@use ... with ()`, or the compiled CSS
- **Classes and data attributes**: `.os-btn[data-variant="outline"]` works in plain HTML too
- **Tailwind-style utilities** with responsive prefixes: `md:os-grid-cols-3`
- **No runtime dependencies** beyond React; tree-shakeable ESM and CommonJS, bundled types, marked `'use client'` for Next.js

## Install

```bash
npm install @onesmall/ui
```

Peer dependencies: `react` and `react-dom` 18 or 19.

### Compatibility

| | Supported | How it is checked |
| --- | --- | --- |
| React | 18 and 19 (`^18 \|\| ^19`) | CI installs the packed tarball into clean React 18 and 19 apps (`npm run test:consumer`): ESM, CommonJS, types, server rendering without warnings, hydration without mismatches |
| Node (your app: SSR, tests, builds) | 18.18 and newer | The same consumer test on Node 18, 20, 22 and 24 |
| TypeScript | 5.x; `moduleResolution` `bundler`, `node16` or `nodenext` | Strict type check in the consumer test (`.d.ts` for `import`, `.d.cts` for `require`) |
| Browsers | Current evergreen browsers (Chrome, Edge, Firefox, Safari). Floating panels use the top layer (Popover API) where available and fall back to `position: fixed` | Playwright layout and axe checks run in Chromium only |
| Bundlers | Anything that reads `exports` (Vite, webpack 5, Next.js, esbuild, Parcel); tree-shakeable | esbuild bundle in the consumer test: `Button` alone is about 2 kB |

Working on this repository (not using the package) needs Node 22.13 or newer, because of Vite 8, Vitest 5 and
ESLint 10.

## Use

Import the CSS once in your app entry, then use the components:

```tsx
import '@onesmall/ui/styles.css';
import { ThemeProvider, ToastProvider, Button, Field, Input, ThemeToggle } from '@onesmall/ui';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ThemeToggle />
        <Field label="Call sign" hint="Shown to your crew.">
          <Input />
        </Field>
        <Button>Launch</Button>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### Entry points

| Import | What |
| --- | --- |
| `@onesmall/ui` | React components, hooks and helpers (ESM `import` and CommonJS `require`, with types) |
| `@onesmall/ui/styles.css` | Compiled CSS (also `styles.min.css`) |
| `@onesmall/ui/dom` | Vanilla data-attribute controls for plain HTML, no React |
| `@onesmall/ui/scss` | Sass entry, for overriding variables |
| `@onesmall/ui/tokens.json` | Color tokens for both themes |

## Components

**Actions:** Button, ButtonGroup, ButtonToolbar, ToggleButton, ToggleButtonGroup, CloseButton, Toggler, Kbd

**Forms:** Field, FieldGroup, FloatingLabel, Form, Input, InputGroup, NumberInput, Textarea, Select, Combobox, Checkbox, Radio / RadioGroup, Switch, Range, Rating, DatePicker, TimePicker, Calendar, OtpInput, PasswordStrength, TagInput, ChipInput (deprecated: use TagInput), DropZone

**Navigation:** Nav, NavMenu, Navbar, Sidebar (`SidebarProvider`, `SidebarToggle`, …), Breadcrumb, Pagination, Tabs, Stepper, ScrollSpy, SkipLink, TreeView, CommandPalette

**Overlays:** Dialog, Drawer, Menu, ContextMenu, Popover, Popconfirm, Tooltip, Toast (`ToastProvider` / `useToast`), Lightbox / LightboxGallery, Portal, Modal (deprecated: use Dialog or Drawer)

**Content and feedback:** Accordion, Alert, Avatar / AvatarGroup, Badge, Blockquote, Card, Carousel, Chip, CodeBlock, Collapse / Collapsible, EmptyState, ListGroup, Progress, Skeleton / Placeholder, SortableList, Spinner, Table, DataTable, Timeline, VisuallyHidden

**Layout and media:** Container, Stack, Grid, AspectRatio, Image, Video

**Motion:** Transition (`data-state` presets), `useTransition`, motion tokens (`motion`)

**Accessibility:** AnnouncerProvider / LiveRegion / `useAnnouncer`, `useFocusTrap`, `useFocusReturn`, `useScrollLock`, `useReducedMotion`, SkipLink, VisuallyHidden

**Icons:** 49 stroke icons (`CheckIcon`, `SearchIcon`, …) and `createIcon`, from `@onesmall/ui/icons` or the root

**Theming:** ThemeProvider, ThemeToggle, `useTheme`, `themeInitScript`, `themes`

**Hooks:** `useControllableState`, `useDisclosure`, `useMediaQuery`, `useBreakpoint`, `useResponsiveValue`, `useCopyToClipboard`, `useDropZone`, `useFloating`, `useHotkeys`, `useSwipe`, `useToggler`, `usePasswordStrength`, `useCollapsible`, `useScrollSpy`, `useSidebar`, `useFieldControl`, `usePrefersReducedMotion` (deprecated alias of `useReducedMotion`)

See the [docs](https://one-small-ui.vercel.app) for every prop and a live example of each.

## Theming

Themes are CSS variables switched by a `data-os-theme="light|dark"` attribute on `<html>` or any element.
`ThemeProvider` follows the OS by default, remembers the user's choice in `localStorage`, and `ThemeToggle`
switches it:

```tsx
<ThemeProvider defaultMode="system" storageKey="my-app-theme">
  <ThemeToggle />
</ThemeProvider>
```

To avoid a flash of the wrong theme on first paint, inline `themeInitScript()` in your HTML `<head>`.
Scope a theme to part of the page with `<section data-os-theme="dark">`.

Override design tokens with plain CSS:

```css
:root {
  --os-primary: #0a5cff;
}
```

Or compile the Sass with your own variables:

```scss
@use '@onesmall/ui/scss' with (
  $radius-base: 6px,
  $prefix: 'os'
);
```

Color tokens live in `tokens/themes.json` (published as `@onesmall/ui/tokens.json`); the build checks every
text and UI pair against WCAG AAA (7:1 text, 3:1 boundaries).

## Accessibility

Components follow the WAI-ARIA Authoring Practices patterns, work with keyboard alone, show a visible focus
ring, respect `prefers-reduced-motion` (or `data-os-motion="off"`), and stay usable in Windows forced-colors
mode. Controls keep pointer targets at least 44×44px, with documented exceptions that still meet the WCAG 2.5.8
AA minimum of 24×24px: Rating half steps are 24×44px each. Floating panels stay inside short viewports and
scroll when content is taller than the room they have.

What is automated: every component has a jest-axe test; the docs site is audited with axe (WCAG A, AA and AAA
rules plus best practices) in light and dark; token contrast is checked at AAA; Playwright checks layout,
overlay positioning and target sizes. What is not: automated checks cannot prove conformance. Screen reader
testing (NVDA, JAWS, VoiceOver, TalkBack) is manual, and we only claim AAA for criteria we measure.

You still own the content: give icon-only buttons a label, images real `alt` text, and videos caption tracks.

## Upgrading, rolling back and uninstalling

**Upgrade** to the latest release and read the [changelog](./CHANGELOG.md) for anything marked deprecated:

```bash
npm install @onesmall/ui@latest
```

Minor releases before 1.0 (0.5 → 0.6) add features and fix bugs without removing public APIs; deprecated APIs
warn once in development and are removed only in a major release.

**Roll back** by pinning the previous version, then reinstall:

```bash
npm install @onesmall/ui@0.5.0 --save-exact
```

If a published version is broken, the maintainer deprecates it on npm (`npm deprecate @onesmall/ui@x.y.z "…"`)
and ships a fixed patch; npm never reuses a version number.

**Uninstall:** remove the package, then the `@onesmall/ui/styles.css` (or `@use '@onesmall/ui/scss'`) import,
`themeInitScript()` in your HTML head, and any `ThemeProvider` / `ToastProvider` / `AnnouncerProvider`
wrappers:

```bash
npm uninstall @onesmall/ui
```

The library writes to `localStorage` only for the theme choice (key `onesmallui-theme`, or your `storageKey`)
and, when you opt in, CommandPalette's recent items and Sidebar's collapsed state (under keys you choose).
Clear those keys if you want no trace left.

## License

[MIT](./LICENSE) © Joshua Small

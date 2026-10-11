# @onesmall/ui

**[ui.onesmall.company](https://ui.onesmall.company)** · [Docs and live examples](https://one-small-ui.vercel.app) · [GitHub](https://github.com/WasteOfADrumBum/one-small-ui)

OneSmallUI (1SmUI): a futuristic, accessible component library for React, written in TypeScript and styled with SCSS.

- **Light and dark themes** driven by CSS variables, following the OS or the user
- **AAA contrast** on every token pair, enforced by a build check
- **Accessible by default**: WCAG 2.2 keyboard support, visible focus, 44px targets, reduced motion and forced-colors (High Contrast) support
- **SCSS variables** you can override with `@use ... with ()`, or the compiled CSS
- **Classes and data attributes**: `.os-btn[data-variant="outline"]` works in plain HTML too
- **Tailwind-style utilities** with responsive prefixes: `md:os-grid-cols-3`
- **No runtime dependencies** beyond React; tree-shakeable ESM and CommonJS, bundled types, marked `'use client'` for Next.js

## Install

```bash
npm install @onesmall/ui
```

Peer dependencies: `react` and `react-dom` 18 or 19.

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

**Actions:** Button, ButtonGroup, ButtonToolbar, ToggleButton, ToggleButtonGroup, CloseButton, Toggler

**Forms:** Field, FieldGroup, FloatingLabel, Form, Input, InputGroup, Textarea, Select, Combobox, Checkbox, Radio / RadioGroup, Switch, Range, DatePicker, Calendar, OtpInput, PasswordStrength, ChipInput, DropZone

**Navigation:** Nav, NavMenu, Navbar, Breadcrumb, Pagination, Tabs, Stepper, ScrollSpy, SkipLink

**Overlays:** Dialog, Drawer, Menu, Popover, Tooltip, Toast (`ToastProvider` / `useToast`), Modal (deprecated: use Dialog or Drawer)

**Content and feedback:** Accordion, Alert, Avatar, Badge, Blockquote, Card, Carousel, Chip, CodeBlock, Collapse, ListGroup, Progress, Skeleton / Placeholder, SortableList, Spinner, Table, VisuallyHidden

**Layout and media:** Container, Stack, Grid, AspectRatio, Image, Video

**Theming:** ThemeProvider, ThemeToggle, `useTheme`, `themeInitScript`

**Hooks:** `useControllableState`, `useDisclosure`, `useMediaQuery`, `useBreakpoint`, `usePrefersReducedMotion`, `useCopyToClipboard`, `useDropZone`, `useFloating`, `useToggler`, `usePasswordStrength`

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
ring, keep pointer targets at least 44×44px, respect `prefers-reduced-motion` (or `data-os-motion="off"`),
and stay usable in Windows forced-colors mode. Every component has an automated axe test, and the docs site
is audited with axe (WCAG A, AA and AAA rules) in both themes.

You still own the content: give icon-only buttons a label, images real `alt` text, and videos caption tracks.

## License

[MIT](./LICENSE) © Joshua Small

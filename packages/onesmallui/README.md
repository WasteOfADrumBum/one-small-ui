# OneSmallUI (1SmUI)

A futuristic, WCAG 2.2 AAA accessible component library for React, written in TypeScript and styled with SCSS.

- **Light and dark themes** driven by CSS variables, following the OS or the user
- **AAA contrast** on every token pair, enforced by a build check
- **SCSS variables** you can override with `@use ... with ()`, or the compiled CSS
- **Classes and data attributes**: `.os-btn[data-variant="outline"]` works in plain HTML too
- **Tailwind-style utilities** with responsive prefixes: `md:os-grid-cols-3`
- **Drag and drop**: upload drop zones and keyboard-accessible sortable lists
- **Smooth motion** that respects `prefers-reduced-motion`
- **No runtime dependencies** beyond React; tree-shakeable ESM; marked `'use client'` for Next.js

## Install

```bash
npm install onesmallui
```

## Use

```tsx
import 'onesmallui/styles.css';
import { ThemeProvider, ToastProvider, Button, ThemeToggle } from 'onesmallui';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ThemeToggle />
        <Button>Launch</Button>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### Customize with SCSS

```scss
@use 'onesmallui/scss' with (
  $radius-base: 6px,
  $prefix: 'os'
);
```

### Use the mixins and functions in your own styles

```scss
@use 'onesmallui/scss/abstracts' as os;

.panel {
  padding: os.space('6');
  background: os.token('surface');
  @include os.focus-ring;
  @include os.up(md) { padding: os.space('8'); }
}
```

## Components

Accordion · Alert · Avatar · Badge · Button · Card · Checkbox · CloseButton · CodeBlock · Container · DropZone ·
Field · Grid · Image · Input · Modal (dialog, drawer, bottom sheet) · Progress · Radio / RadioGroup · Select ·
Skeleton · SkipLink · SortableList · Spinner · Stack · Switch · Tabs · Textarea · ThemeProvider / ThemeToggle ·
Toast · Tooltip · Video · AspectRatio · VisuallyHidden

Hooks: `useTheme`, `useToast`, `useDropZone`, `useBreakpoint`, `useMediaQuery`, `usePrefersReducedMotion`,
`useDisclosure`, `useCopyToClipboard`, `useControllableState`.

## License

MIT

---
name: onesmallui
description: Build React UIs with the OneSmallUI (1SmUI) component library — components, os- utility classes, theming, forms and data-attribute JS. Use when a project depends on `onesmallui` or asks for 1SmUI.
---

# Using OneSmallUI (1SmUI)

Full reference (every component, props table and example source): https://one-small-ui.vercel.app/llms-full.txt
Index: https://one-small-ui.vercel.app/llms.txt · Structured data: https://one-small-ui.vercel.app/components.json

## Setup

1. `npm install onesmallui` (peer: react >= 18; no other runtime deps).
2. Import CSS once: `import 'onesmallui/styles.css'`, or `@use 'onesmallui/scss' with (...)` to override Sass variables.
3. Wrap the app: `<ThemeProvider><ToastProvider>…</ToastProvider></ThemeProvider>`.
4. Everything is a named export: `import { Button, Field, Input, Dialog, Menu } from 'onesmallui'`.

## Conventions

- Classes are prefixed `os-`; variants are data attributes: `<button class="os-btn" data-variant="soft" data-color="success" data-size="sm">`.
- Colors: `primary | secondary | accent | success | warning | danger | info | inverse` (+ `neutral` where noted). Sizes: `xs | sm | md | lg`.
- Utilities are Tailwind-style with the prefix and responsive `bp:` prefixes: `os-flex os-gap-4 md:os-grid md:os-grid-cols-3`. Breakpoints: sm 576, md 768, lg 1024, xl 1280, 2xl 1536.
- Themes: `data-os-theme="light|dark"` on `<html>` or any element; tokens are CSS variables `--os-<token>`.
- Controlled/uncontrolled pattern: `value` / `defaultValue` / `onValueChange`; overlays use `open` / `onOpenChange` or `onClose`.
- Placement props accept `top | bottom | left | right` with `-start`/`-end`, or per-breakpoint objects `{ base: 'bottom', md: 'right' }`.
- Without React, `onesmallui/dom` wires up `data-os-toggle`, `data-os-target` and `data-os-dismiss` attributes and dispatches `os:show/os:shown/os:hide/os:hidden` events.

## Accessibility rules (the library targets WCAG 2.2 AAA — keep it that way)

- Always give form controls a label: wrap them in `<Field label="…">` (it wires hints and errors).
- Icon-only buttons need `aria-label`. Images need `alt` (the type requires it).
- Don't override colors with raw values; use tokens or the color props so contrast stays at 7:1.
- Keep toasts persistent and carousels non-autoplaying unless the user can pause them.

# Contributing to OneSmallUI

How the library is built, so every component feels like the same library.

## Components (`packages/onesmallui/src/components`)

- One file per component family (`Menu.tsx` can export `Menu`, `MenuItem`, `MenuDivider`). Export it from `components/index.ts` (keep alphabetical).
- Root class from `cls('name')` → `os-name`; parts use BEM: `os-name__part`. Variants, sizes, colors and states are **data attributes**, never modifier classes: `data-variant`, `data-color`, `data-size`, `data-state="open|closed|active"`, `data-orientation`. Boolean flags render as `data-flag` (present) or nothing: `data-full-width={fullWidth || undefined}`.
- `forwardRef` for anything with a single DOM root; spread `...rest` onto the root; merge `className` with `cx()`.
- Controlled + uncontrolled state through `useControllableState(value, defaultValue, onValueChange)`. Callbacks are named `on<Thing>Change`.
- Ids: `` `os-<thing>-${useId().replace(/:/g, '')}` ``.
- Shared types live in `components/types.ts`: `Size`, `ExtendedSize` (adds `xs`), `ThemeColor` / `Color` (8 theme colors + `neutral`), `Placement`.
- Anything anchored to a trigger (menus, popovers, tooltips, pickers) uses `useFloating` / `computePosition` from `hooks/useFloating` and `utils/position` plus the `.os-floating` class, and `showInTopLayer()` for top-layer rendering. Placement props accept `ResponsiveValue<Placement>`.
- Overlay appearance: `appearance?: 'default' | 'dark' | 'translucent'`. `dark` sets `data-os-theme="dark"` on the root (re-scopes every token); `translucent` sets `data-appearance="translucent"`.
- Prefer native elements: `<dialog>`, `<details>`, real `<input>`s, `<button>`. No runtime dependencies.

## Accessibility (WCAG 2.2 AAA is the bar)

- Follow the WAI-ARIA Authoring Practices pattern for the widget (menu, combobox, tabs, listbox, carousel, grid for datepicker).
- 44×44px minimum target size (extend hit areas with `::after` when the visual is smaller).
- Focus ring via `@include focus-ring`. Text 7:1, UI boundaries 3:1, using tokens only (no raw colors).
- Keyboard: every pointer interaction has a keyboard path; Escape closes overlays and returns focus to the trigger.
- No timing by default (auto-advancing carousels and auto-hiding toasts are opt-in and pausable).

## Styles (`packages/onesmallui/scss`)

- One partial per area in `scss/components/`, `@use`d from `components/_index.scss`. Start with `@use '../abstracts' as *;`.
- Colors only through `token('name')`. Use `@include color-vars;` to get `--_c`, `--_c-hover`, `--_on`, `--_soft`, `--_text` per `data-color`, looping `$theme-colors`.
- Logical properties only (`margin-inline-start`, `inset-inline-end`, `padding-block`), so RTL works. Multiply horizontal transforms by `var(--os-dir)`.
- Motion through `dur()` / `ease()` tokens so reduced motion and `data-os-motion="off"` switch it off.
- The build wraps everything in cascade layers (`os.tokens`, `os.reset`, `os.base`, `os.components`, `os.utilities`); don't add `!important`.

## Docs (`apps/docs`)

- One page = one file in `apps/docs/src/docs/<slug>.ts` exporting a `ComponentDoc` (see `site/docTypes.ts`). It shows up in the nav and the a11y audit automatically.
- Examples are files in `apps/docs/src/examples/<name>.tsx` with a default export. They render live and their source is shown verbatim, so keep them short, realistic and copy-ready (import from `'onesmallui'` only).

## Checks

```bash
npm run check:contrast   # token pairs at AAA
npm run typecheck
npm test                 # Vitest + Testing Library + axe (add tests in packages/onesmallui/test/<area>.test.tsx)
npm run build
npm run test:a11y        # axe A/AA/AAA on every docs page, light and dark (ROUTES=menu,nav to filter)
```

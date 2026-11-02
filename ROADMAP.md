# OneSmallUI roadmap

Future work after 0.6.0. Nothing here is scheduled into a release until it has a scope document
(Engineering Hub release process, step 1). Page blocks stay deferred until there is a spec.

Priorities: **P0** blocks the next release, **P1** next minor, **P2** when there is room.

Measurements below were taken on 2026-11-02 against the published `@onesmall/ui@0.6.0` tarball
(sha256 `9390f28a…c46f`), in a scratch Vite 6 + React 19 app with production minification. "Delta" means bytes added
over the same app rendering plain React (223,103 B minified, 68,891 B gzip).

## 0. Release provenance for the next release (P0)

- **Current capability:** CI verifies everything up to the tarball; the maintainer publishes from a workstation.
  0.6.0 has no npm attestation and an unsigned tag ([acceptance record](docs/releases/0.6.0-acceptance.md)).
- **Gap:** the hub's `release-provenance` gate is unmet, and there is no publish pipeline (`ci-release-pipeline`).
- **Acceptance criteria:**
  - A `workflow_dispatch` release workflow with least-privilege permissions (`contents: read`, `id-token: write`).
  - npm trusted publishing configured for `@onesmall/ui` on npmjs.com, so no long-lived npm token is stored.
  - The workflow checks out the tagged candidate, runs `npm ci`, the checks and `npm pack`, and compares the
    sha512 with the value recorded in the readiness report before publishing with provenance.
  - Afterwards `npm view @onesmall/ui@<v> dist.attestations` is present, and `docs/RELEASING.md` §3 describes the
    workflow instead of a local publish.

## 1. Package footprint (P2)

**Current capability.** The JS build uses `preserveModules` with `sideEffects: ["*.css", "*.scss"]`, so named
imports tree-shake well. The published tarball breaks down like this:

| Content | Files | Unpacked | Share |
| --- | ---: | ---: | ---: |
| Source maps (`.map`, all with `sourcesContent`) | 299 | 2,214 KiB | 45% |
| Compiled CSS (`onesmallui.css` 454 KiB + `.min.css` 349 KiB) | 2 | 803 KiB | 16% |
| CommonJS JS | 151 | 610 KiB | 12% |
| ESM JS | 151 | 542 KiB | 11% |
| Type declarations (`index.d.ts` and `index.d.cts` are byte-identical, 189 KiB each) | 6 | 399 KiB | 8% |
| SCSS source | 65 | 288 KiB | 6% |
| Other (README, CHANGELOG, SKILL.md, JSON, IIFE build) | 7 | 59 KiB | 1% |
| **Total** | **681** | **4.80 MiB** | |

The compressed tarball is 1,068,534 B. Repacked without the source maps it is 597,635 B (44% smaller).
Source maps are never part of a consumer's production bundle; they only cost install size and disk.

What consumers actually ship (delta over plain React):

| Import | JS minified | JS gzip |
| --- | ---: | ---: |
| `Button` | +2,033 B | +803 B |
| one icon from `@onesmall/ui/icons` | +934 B | +473 B |
| `Button` + `Dialog` | +11,668 B | +4,310 B |
| `DataTable` | +43,106 B | +14,758 B |
| `import * as UI` (everything kept) | +260,984 B | +87,107 B |
| `@onesmall/ui/styles.min.css` | 355,761 B CSS | 52,443 B |

**Gap.** For a small app the CSS costs about 65 times the JS (52 KB versus 0.8 KB gzip for a button), and the
compiled CSS is all or nothing. Install size is dominated by source maps and duplicated declarations, which is a
download cost, not a runtime cost.

**Acceptance criteria:**

- A `npm run size` script (no new dependencies) that prints the tables above from the packed tarball, runs in CI
  and fails on a budget increase above an agreed threshold.
- A decision, recorded in a scope document, on whether to keep source maps in the tarball. If they stay, say why
  (debuggable stack traces). If they go, the consumer smoke still passes and the tarball shrinks by about 44%.
- `index.d.cts` deduplicated only if `attw`-style checks (or the existing node16/bundler type checks in
  `test:consumer`) still pass for both `import` and `require`.

## 2. Selective consumption (P1)

**Current capability, which works today and is under-documented:**

- Named imports from `@onesmall/ui` tree-shake (table above). Per-component JS entrypoints would not help: a
  button already costs about 2 KB.
- Subpaths: `@onesmall/ui/icons`, `@onesmall/ui/dom` (no React), `@onesmall/ui/tokens.json`,
  `@onesmall/ui/agent/SKILL.md`.
- Sass tools only, no CSS output: `@use '@onesmall/ui/scss/abstracts' as os;`.
- Partial Sass output works if you give full file paths:

  ```scss
  @use 'sass:meta';
  @include meta.load-css('@onesmall/ui/scss/themes/index.scss');
  @include meta.load-css('@onesmall/ui/scss/base/_reset.scss');
  @include meta.load-css('@onesmall/ui/scss/components/_button.scss');
  ```

  This compiled to 23,465 B (5,119 B gzip) versus 356,476 B (52,478 B gzip) for the full Sass entry. Visual
  parity of that partial build was **not** checked.

**Gap.**

- The package README's entry-point table omits `/icons`, `/scss/*` and `/agent/SKILL.md`.
- `@onesmall/ui/scss/themes` without the file name fails to resolve, because `./scss/*` maps paths literally.
- There is no documented list of which partials each component needs (icon sizing, overlay offsets,
  floating, transition, forced-colors), and cascade layers are lost when partials are loaded directly.

**Acceptance criteria:**

- The README documents every subpath and the partial-Sass recipe, with measured sizes.
- A supported per-component Sass entry (for example `@onesmall/ui/scss/components/button`) that pulls in its own
  dependencies and keeps the `os.*` cascade layers. Add it only for the components where the measured CSS
  saving is at least 50% against the full stylesheet for a typical subset.
- `test:consumer` builds a partial-Sass app, and `test:layout` compares it with the full stylesheet for the
  covered components.

## 3. Company theme generation (P1)

**Current capability.**

- One token source: `packages/onesmallui/tokens/themes.json`, with `light` and `dark` palettes of 52 tokens each
  (surfaces, text, focus, and `base / hover / on- / soft / text` for 8 colors), plus `motion`.
- `scripts/build-tokens.mjs` generates SCSS maps and `src/tokens.ts`. `scripts/check-contrast.mjs` checks
  text at 7:1 and boundaries at 3:1, for the library's own themes only.
- Consumers can override `--os-*` variables in CSS or Sass, but nothing derives the related tokens or checks
  the contrast of their overrides.

**Gap.** There is no way to go from brand hex colors to a complete, checked theme. A consumer who sets
`--os-primary` by hand also has to work out `primary-hover`, `on-primary`, `primary-soft` and `primary-text` for
both modes, and gets no warning when a pair fails.

**Acceptance criteria:**

- A script or package bin (no new runtime dependencies) that takes brand colors, at least primary and
  optionally secondary, accent and neutral, and writes an editable `themes.json`-shaped file plus CSS
  (`[data-os-theme="light"]` and `[data-os-theme="dark"]` blocks) and a Sass map.
- It derives hover, soft, text and on- colors for light and dark, and uses the library's success, warning,
  danger and info colors unless the caller overrides them.
- It runs the same pair list as `check-contrast.mjs`, moved into `tokens-lib.mjs` so both use one list, and
  prints every failing pair with its ratio and target. It never claims compliance while any pair fails.
  `--strict` exits non-zero.
- When a brand color can't pass as given, such as a light yellow as `primary` on white, the report says so and
  offers the nearest passing color separately, without silently replacing the brand color.
- Fixtures cover a passing brand, a failing brand and a dark-only problem. The generated CSS loads in the
  consumer smoke, and the theming docs show the workflow.

## 4. AI integration (P2)

**Current capability.**

- `packages/onesmallui/agent/SKILL.md` (37 lines) ships in the package and is exported as
  `@onesmall/ui/agent/SKILL.md`. It covers setup, the class and data-attribute conventions, themes, icons,
  motion, the vanilla `dom` layer and accessibility rules.
- `scripts/build-llms.mjs` writes `llms.txt`, `llms-full.txt` and `components.json` into the docs build, from
  the same data the docs pages use, including each component's import line, props and example source.
- The root `AGENTS.md` and `GEMINI.md` hold only the Engineering Hub continuity block. The detailed
  conventions live in `CLAUDE.md`, which is for repository contributors and doesn't ship.
- The consumer smoke only checks that `SKILL.md` is in the tarball.

**Gap.**

- There is no component-selection guidance in SKILL.md: Dialog vs Drawer vs Popconfirm, Menu vs ContextMenu vs
  CommandPalette, and deprecations (`Modal` → Dialog or Drawer, `ChipInput` → TagInput,
  `usePrefersReducedMotion` → `useReducedMotion`).
- It has no selective-import or theme-generation instructions, and no copy-paste prompts.
- `components.json` has no `deprecated` or `useInstead` fields.
- SKILL.md links to `one-small-ui.vercel.app` while the package `homepage` is `ui.onesmall.company`. The live
  machine-readable files could not be fetched from this session (proxy 403), so whether they match 0.6.0 is
  unchecked.
- Nothing tests that following SKILL.md produces a working app.

**Acceptance criteria:**

- SKILL.md gets a "which component" table, the deprecations, the import recipes from item 2 and, once item 3
  lands, the theme-generation steps. It states the package version it describes.
- `components.json` adds `deprecated`, `useInstead` and `minimalExample` for every exported component. A test
  fails when a barrel export is missing from it.
- `docs/ai-prompts.md` has copy-paste prompts (set up the library, build a form, add a themed dashboard,
  generate a company theme), each backed by an example app under `examples/`.
- CI builds those example apps from the packed tarball in `test:consumer`, and type-checks every TSX snippet
  in SKILL.md, so the instructions can't drift from the API.
- One canonical docs host, used by SKILL.md, `llms.txt` and `homepage`.

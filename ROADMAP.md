# OneSmallUI roadmap

Optional future work for `@onesmall/ui`. **Nothing here blocks or reopens 0.6.0**, which is published (npm `latest`
0.6.0, tag `v0.6.0` at `9a13c9e`) and scoped in [docs/releases/0.6.0-scope.md](docs/releases/0.6.0-scope.md). Gates
and status live in the
[One Small Engineering hub](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/projects/registry.json).
Once 0.6.0 is accepted the library is in maintenance: patch releases for defects and security only, until the owner
scopes the next minor release from this list.

Priority: **P1** next, **P2** useful, **P3** nice to have.

## E1. Page blocks (P1, needs an owner spec)

- **Purpose:** the "Phase 5" page-level building blocks deferred from 0.6.0.
- **Scope:** only what an owner-written spec names (which blocks, API shape, responsive rules). No work starts without
  that spec.
- **Acceptance criteria:** spec committed under `docs/`; each block has jest-axe and layout tests, docs page with
  examples, no breaking change to existing exports; `npm run check`, `test:a11y`, `test:layout` and `test:consumer`
  green.
- **Dependencies:** owner spec.

## E2. Short-viewport behaviour beyond Chromium (P2)

- **Purpose:** 0.6.0 verified floating-panel clamping in Chromium only.
- **Scope:** run the short-viewport layout fixtures in Firefox and WebKit through Playwright.
- **Acceptance criteria:** fixtures pass in all three engines in CI.
- **Dependencies:** Playwright browsers on the pinned runner image.

## E3. Keyboard scrolling for non-focusable Popover content in Safari (P2)

- **Purpose:** close the documented known limitation.
- **Scope:** make scrollable Popover bodies focusable (`tabindex="0"` with an accessible name) when they contain no
  focusable content.
- **Acceptance criteria:** Safari keyboard user can scroll; axe still 0 violations; no focus trap regression.
- **Dependencies:** none.

## E4. Dev-only `minimatch` advisories (P3)

- **Purpose:** clear the 2 moderate advisories inside `eslint-plugin-jsx-a11y` (accepted by the owner for 0.6.0 as
  dev-only; production audit clean).
- **Scope:** upgrade when upstream ships a fixed range; never `npm audit fix --force`.
- **Acceptance criteria:** `npm audit` 0 moderate or higher; lint rules unchanged.
- **Dependencies:** upstream release.

## E5. npm provenance through trusted publishing (P2)

- **Purpose:** supply-chain signal (`release-provenance` gate) for the next release.
- **Scope:** release workflow with `id-token: write` in the publish job only; trusted publisher configured on npmjs.com.
- **Acceptance criteria:** `npm view @onesmall/ui@<next> --json` shows provenance; permissions reviewed.
- **Dependencies:** owner configures trusted publishing.

## E6. Require the Consumer checks (P3)

- **Purpose:** keep React 18/19 consumer coverage enforced.
- **Scope:** add `Consumer (Node 18/20/22/24)` to the required status checks.
- **Acceptance criteria:** a PR cannot merge with a failing consumer job.
- **Dependencies:** owner repository settings.

## E7. Remove ChipInput (planned for 1.0.0)

- **Purpose:** planned breaking cleanup.
- **Scope:** remove the deprecated export with a migration note.
- **Acceptance criteria:** CHANGELOG migration note; consumer smoke updated.
- **Dependencies:** a 1.0.0 scope.

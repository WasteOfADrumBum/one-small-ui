<!-- generated from .engineering/state.json (revision 1); edit state.json through a checkpoint, not this file -->

# one-small-ui: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: v0.6.0 release candidate (hardening release)
- Active task: v060-rc: Hand v0.6.0 candidate to the owner for acceptance and publication
- Branch: `claude/project-thread-vlqigd`
- Recorded commit: `9a13c9e` on `main`
- Last checkpoint: 2026-11-01T03:45:00Z by Claude Code

## Next action

Owner: review docs/releases/0.6.0-release-notes.md and the readiness report, decide on the jsx-a11y moderate advisory, run manual screen-reader and keyboard checks, then follow docs/RELEASING.md to publish 0.6.0 and tag v0.6.0 at 9a13c9e (or a later green main commit).

## Completed

- #31 dependency security: Vitest 5 and ESLint 10; critical vitest/tinypool advisories removed; production audit 0
- #32 short-viewport positioning: main-axis clamp, --os-floating-available-height caps, TimePicker width fix
- #33 React 18/19 consumer smoke on the packed tarball (CI Node 18/20/22/24); SSR-safe layout effects
- #34 version 0.6.0, CHANGELOG, compatibility table, docs/RELEASING.md, release notes, revised accessibility claims
- Candidate artifact onesmall-ui-0.6.0.tgz packed at 9a13c9e: sha256 9390f28a27ca211f56ad76eddbec25869b02d29e32a1114b26f674ec0fecc46f, 681 files; consumer smoke 48/48

## In progress

_none recorded_

## Tests (agent-reported)

- `npm run check (CI, ubuntu + windows)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:layout / test:a11y (CI Playwright)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:consumer (CI Node 18/20/22/24)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `CI on main candidate (all jobs)`: pass at `9a13c9e`, 2026-11-01T03:37:34Z
- `node scripts/consumer-smoke.mjs onesmall-ui-0.6.0.tgz (local, Node 22, 48 checks)`: pass at `9a13c9e`, 2026-11-01T03:38:00Z
- `npm audit --omit=dev`: pass at `979381e`, 2026-11-01T02:30:00Z

## Unverified changes

- No human screen-reader (NVDA, JAWS, VoiceOver, TalkBack) or manual keyboard verification of 0.6.0 changes yet.
- Short-viewport behaviour verified in Chromium only (Playwright); Firefox and Safari not exercised.

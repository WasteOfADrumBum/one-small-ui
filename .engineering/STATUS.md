<!-- generated from .engineering/state.json (revision 2); edit state.json through a checkpoint, not this file -->

# one-small-ui: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: v0.6.0 published; owner acceptance under the hub Library Definition of Done pending
- Active task: v060-acceptance: Record 0.6.0 gate verifications and owner approval in the hub, then move to maintenance
- Branch: `claude/closeout-roadmap`
- Recorded commit: `408b884` on `main`
- Last checkpoint: 2026-11-02T17:07:35Z by Claude Code

## Next action

Owner: record 0.6.0 gate verifications with verify:record in the hub (docs/acceptance/closeout-2026-11-02.md) and approve the release there; then set lifecycle maintenance. Page blocks and other roadmap items need their own scoped release.

## Completed

- 0.6.0 hardening release: #31 to #35 (security, short viewports, React 18/19 consumer tests, docs, readiness report)
- GitHub-confirmed 2026-11-02: npm @onesmall/ui latest = 0.6.0 with dist.integrity matching the candidate sha512; annotated tag v0.6.0 (tagger Joshua Small) at 9a13c9e; GitHub release v0.6.0 published by WasteOfADrumBum
- Owner reported (Joshua Small, project chat 2026-11-02): manual acceptance passed in Chrome with Windows Narrator, live docs accepted, the two moderate dev-only advisories accepted. Recorded as owner-reported evidence in the hub acceptance record; not gate verifications
- Branch claude/closeout-roadmap: ROADMAP.md and README release/roadmap links

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

- Manual assistive-technology acceptance is owner-reported (Chrome + Windows Narrator); not yet recorded through verify:record.
- Short-viewport behaviour verified in Chromium only (Playwright); Firefox and Safari not exercised (ROADMAP E2).

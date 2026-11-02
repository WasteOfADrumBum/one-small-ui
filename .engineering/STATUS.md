<!-- generated from .engineering/state.json (revision 2); edit state.json through a checkpoint, not this file -->

# one-small-ui: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: v0.6.0 published; closeout and acceptance record
- Active task: v060-closeout: Close out the published 0.6.0 release and write the roadmap
- Branch: `claude/project-thread-9t8tjt`
- Recorded commit: `9a13c9e` on `main`
- Last checkpoint: 2026-11-02T17:10:00Z by Claude Code

## Next action

Owner: choose a provenance option in docs/releases/0.6.0-acceptance.md section E, approve the closeout PR, then open the hub registry PR with verifier evidence and approval for 0.6.0. Agents: no roadmap work until a scope document exists.

## Completed

- Owner published @onesmall/ui 0.6.0 to npm (2026-11-02T14:19:57Z) and created tag v0.6.0 (annotated, unsigned) and the GitHub release at 9a13c9e (owner action, checked by the agent against npm and GitHub)
- npm dist.integrity equals the candidate sha512; npm tarball sha256 9390f28a27ca211f56ad76eddbec25869b02d29e32a1114b26f674ec0fecc46f; a clean rebuild from v0.6.0 reproduces it byte for byte
- docs/releases/0.6.0-acceptance.md: draft owner acceptance record (owner confirmations quoted, gate evidence table, unmet items, provenance options)
- docs/RELEASING.md: provenance now required (hub gate release-provenance); tags created with git tag -s
- ROADMAP.md: provenance pipeline, package footprint (measured), selective consumption, theme generation, AI integration

## In progress

_none recorded_

## Tests (agent-reported)

- `npm run check (CI, ubuntu + windows)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:layout / test:a11y (CI Playwright)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:consumer (CI Node 18/20/22/24)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `CI on main candidate (all jobs)`: pass at `9a13c9e`, 2026-11-01T03:37:34Z
- `node scripts/consumer-smoke.mjs onesmall-ui-0.6.0.tgz (local, Node 22, 48 checks)`: pass at `9a13c9e`, 2026-11-01T03:38:00Z
- `npm audit --omit=dev`: pass at `979381e`, 2026-11-01T02:30:00Z
- `npm view @onesmall/ui@0.6.0 --json; npm pack @onesmall/ui@0.6.0; sha256sum`: pass at `9a13c9e`, 2026-11-02T16:55:00Z
- `clean worktree at v0.6.0: npm ci && npm run build:lib && npm pack -w @onesmall/ui (sha256 compared with npm tarball)`: pass at `9a13c9e`, 2026-11-02T17:05:00Z

## Unverified changes

- Owner reported a manual acceptance pass in Chrome with Windows Narrator and accepted the live docs (2026-11-02); recorded as the owner's statement, not as agent verification. Other screen readers and browsers were not covered.
- Short-viewport behaviour verified in Chromium only (Playwright); Firefox and Safari not exercised.
- Branch protection for the Consumer checks could not be read from the agent session.

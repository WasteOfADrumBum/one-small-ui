<!-- generated from .engineering/state.json (revision 3); edit state.json through a checkpoint, not this file -->

# one-small-ui: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: 0.6.1 release candidate on main (unpublished); CI/CD hardening
- Active task: ci-cd-evidence: Bring CI/CD to an evidence-backed standard (one consolidated PR)
- Branch: `claude/project-thread-mv5bx9`
- Recorded commit: `ee62089` on `claude/project-thread-mv5bx9`
- Last checkpoint: 2026-11-06T00:40:00Z by Claude Code

## Next action

Check the PR from claude/project-thread-mv5bx9 and its CI. After merge: dispatch Publish package with dry_run true for the merge SHA and record the run; confirm docs-smoke passed on the production deploy. Owner: add the main ruleset and the npm-publish environment (docs/ci-cd.md#releasing).

## Completed

- Baseline: CI run 41840159196 on ee62089 took 4m28s wall; Playwright (a11y) was the critical path; 8 independent builds; mutable action tags; publish.yml rebuilt the package and did not require browser CI
- ci.yml: one build and pack per run (package artifact with sha256/sha512 manifest), CI gate check, concurrency, timeouts, SHA-pinned actions, Security job (audit-deps, npm audit signatures, actionlint, zizmor, gitleaks with sha256-verified downloads), Firefox and WebKit behaviour checks
- publish.yml: exact-candidate gating (scripts/release-verify.mjs + release-lib.mjs, 8 policy tests), consumes only the verified CI artifact, byte-identical rebuild check, dry_run default true, OIDC provenance publish in environment npm-publish
- codeql.yml, dependabot.yml (7/30-day cooldown), security/audit-exceptions.json, ESLint security rules for library source
- Fix: Escape or cancel in a nested Dialog no longer closes its parent (DialogBase); regression tests in test/behavior.test.tsx
- Docs: security headers and CSP in vercel.json, build-info.json, canonical URL, not-found route, docs-smoke.yml; docs/ci-cd.md

## In progress

- Open the consolidated PR, get CI green, independent review, merge, dry run, docs smoke

## Tests (agent-reported)

- `npm run check (CI, ubuntu + windows)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:layout / test:a11y (CI Playwright)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `npm run test:consumer (CI Node 18/20/22/24)`: pass at `a787950`, 2026-11-01T03:30:00Z
- `CI on main candidate (all jobs)`: pass at `9a13c9e`, 2026-11-01T03:37:34Z
- `node scripts/consumer-smoke.mjs onesmall-ui-0.6.0.tgz (local, Node 22, 48 checks)`: pass at `9a13c9e`, 2026-11-01T03:38:00Z
- `npm audit --omit=dev`: pass at `979381e`, 2026-11-01T02:30:00Z
- `npm view @onesmall/ui@0.6.0 --json; npm pack @onesmall/ui@0.6.0; sha256sum`: pass at `9a13c9e`, 2026-11-02T16:55:00Z
- `clean worktree at v0.6.0: npm ci && npm run build:lib && npm pack -w @onesmall/ui (sha256 compared with npm tarball)`: pass at `9a13c9e`, 2026-11-02T17:05:00Z
- `npm run check (local, Node 22: 720 tests, 8 script tests)`: pass at `ee62089`, 2026-11-05T19:40:00Z
- `npm run build; npm run package:check (local)`: pass at `ee62089`, 2026-11-05T19:45:00Z
- `npm run test:browsers (local, Chromium, 26 checks)`: pass at `ee62089`, 2026-11-05T17:30:00Z
- `node scripts/consumer-smoke.mjs (local, Node 22, 56 checks)`: pass at `ee62089`, 2026-11-05T16:30:00Z

## Unverified changes

- Owner reported a manual acceptance pass in Chrome with Windows Narrator and accepted the live docs (2026-11-02); recorded as the owner's statement, not as agent verification. Other screen readers and browsers were not covered.
- Short-viewport behaviour verified in Chromium only (Playwright); Firefox and Safari not exercised.
- Branch protection for the Consumer checks could not be read from the agent session.
- actionlint, zizmor, gitleaks, CodeQL, Firefox and WebKit checks and the full a11y run had not run when this checkpoint was written; see the PR's CI.
- docs-smoke.mjs had not run against the live site (the agent container cannot reach it).

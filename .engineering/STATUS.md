<!-- generated from .engineering/state.json (revision 5); edit state.json through a checkpoint, not this file -->

# one-small-ui: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: 0.6.1 release candidate on main (unpublished); CI/CD hardening merged
- Active task: ci-cd-evidence: Bring CI/CD to an evidence-backed standard (one consolidated PR)
- Branch: `main`
- Recorded commit: `acc4dbc` on `main`
- Last checkpoint: 2026-11-12T02:08:42Z by Claude Code

## Next action

Owner: add the main ruleset (PRs + CI gate, no force push/deletion), create the npm-publish environment with a required reviewer limited to main, and register the npm trusted publisher (environment npm-publish). Then the owner may run Publish package with dry_run off for the current main head. Consider pre-installing or caching the Playwright OS deps for Firefox/WebKit (apt mirror slowness caused one timeout).

## Completed

- [withheld: possible sensitive data]
- ci.yml: one build and pack per run (package artifact with sha256/sha512 manifest), CI gate check, concurrency, timeouts, SHA-pinned actions, Security job (audit-deps, npm audit signatures, actionlint, zizmor, gitleaks with sha256-verified downloads), Firefox and WebKit behaviour checks
- publish.yml: exact-candidate gating (scripts/release-verify.mjs + release-lib.mjs, 8 policy tests), consumes only the verified CI artifact, byte-identical rebuild check, dry_run default true, OIDC provenance publish in environment npm-publish
- codeql.yml, dependabot.yml (7/30-day cooldown), security/audit-exceptions.json, ESLint security rules for library source
- Fix: Escape or cancel in a nested Dialog no longer closes its parent (DialogBase); regression tests in test/behavior.test.tsx
- Docs: security headers and CSP in vercel.json, build-info.json, canonical URL, not-found route, docs-smoke.yml; docs/ci-cd.md
- [withheld: possible sensitive data]
- [withheld: possible sensitive data]
- [withheld: possible sensitive data]
- [withheld: possible sensitive data]
- Tarball onesmall-ui-0.6.1.tgz sha256 b400fe818061bf1d2e3e294ce9fd9c5518233ee5f3576ab60a98c6bb6ba64727, npm shasum 4c04fef1ee83710499ac6494d17a02f1ad0c402b. release-package artifact (90 days).
- npm registry after the dry run: dist-tags latest 0.6.0; versions 0.0.0-stage, 0.1.0, 0.5.0, 0.6.0 (no 0.6.1). No publish, tag, release or dist-tag change was made.

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
- `npm run check (local, Node 22: 720 tests, 8 script tests) (run on ee62089 + uncommitted branch changes)`: pass, 2026-11-05T19:40:00Z
- `npm run build; npm run package:check (local) (run on ee62089 + uncommitted branch changes)`: pass, 2026-11-05T19:45:00Z
- `npm run test:browsers (local, Chromium, 26 checks) (run on ee62089 + uncommitted branch changes)`: pass, 2026-11-05T17:30:00Z
- `node scripts/consumer-smoke.mjs (local, Node 22, 56 checks) (run on ee62089 + uncommitted branch changes)`: pass, 2026-11-05T16:30:00Z
- `CI (all jobs, PR head)`: pass at `2446d47`, 2026-11-06T00:55:22Z
- `CI on main (attempt 1 webkit timeout; attempt 2 green)`: pass at `acc4dbc`, 2026-11-06T01:19:46Z
- `CodeQL on main`: pass at `acc4dbc`, 2026-11-06T00:59:32Z
- `Docs smoke (production, 48 checks)`: pass at `acc4dbc`, 2026-11-06T00:59:32Z
- `Publish package dry run (dry_run true)`: pass at `acc4dbc`, 2026-11-06T05:25:47Z
- `npm view @onesmall/ui dist-tags versions`: pass at `acc4dbc`, 2026-11-06T05:33:00Z

## Unverified changes

- Owner reported a manual acceptance pass in Chrome with Windows Narrator and accepted the live docs (2026-11-02); recorded as the owner's statement, not as agent verification. Other screen readers and browsers were not covered.
- Short-viewport behaviour verified in Chromium only (Playwright); Firefox and Safari not exercised.
- Branch protection for the Consumer checks could not be read from the agent session.
- The real publish path (OIDC trusted publishing, npm-publish environment, provenance, registry integrity check) cannot be exercised without publishing; it is unverified.

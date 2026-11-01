<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: one-small-ui

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `v060-rc-9a13c9e`, 2026-11-01T03:45:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Code for 0.6.0 is merged on main at 9a13c9e with green CI. Nothing is published. Readiness report: docs/releases/0.6.0-readiness.md. Publishing steps: docs/RELEASING.md. Do not re-run the hardening work; pick up from the owner's decisions.

## Unfinished

- npm publish 0.6.0 (owner)
- Tag v0.6.0 and GitHub release (owner)
- Human accessibility verification (owner or delegate)

## Blockers

- Publication and tagging need explicit owner authorization.
- Accept or reject the dev-only jsx-a11y moderate advisory (owner).

## Decisions

- [agent] No page-block spec existed in the repo, project files or hub, so 0.6.0 was frozen as a hardening release (security, short viewports, compatibility, packaging, docs). Page blocks deferred. Documented in docs/releases/0.6.0-scope.md.
- [agent] Root workspace engines raised to node >=22.13 for dev tooling (ESLint 10, Vitest 5); the published library keeps >=18.18, verified by the Consumer CI matrix.
- [agent] Package description and README claim WCAG 2.2 AA with AAA contrast (automated checks), not blanket AAA; manual assistive-technology verification is listed as pending.

## Constraints

- Never publish to npm or create release tags without the owner; release approval belongs to Joshua Small.
- Every PR targets main; npm scripts must stay cross-platform (Windows).
- Do not run npm audit fix --force or disable audit rules or tests.

## Unresolved decisions

- Page-block (Phase 5) scope needs an owner-written spec before any work.
- Two moderate dev-only advisories (minimatch 3 inside eslint-plugin-jsx-a11y) await owner acceptance or an upstream fix; production audit is clean.
- Scrollable Popover bodies without focusable content are not keyboard-scrollable in Safari (known limitation, documented).

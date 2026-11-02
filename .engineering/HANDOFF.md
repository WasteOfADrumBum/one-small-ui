<!-- generated from .engineering/state.json (revision 2) -->

# Handoff: one-small-ui

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 2, `closeout-2026-11-02-ui`, 2026-11-02T17:07:35Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

0.6.0 is published and tagged; do not re-run the hardening work. Next work comes only from ROADMAP.md after the owner scopes it.

## Unfinished

- Hub verify:record entries and owner approval for 0.6.0.

## Blockers

_none recorded_

## Decisions

- [agent] No page-block spec existed in the repo, project files or hub, so 0.6.0 was frozen as a hardening release (security, short viewports, compatibility, packaging, docs). Page blocks deferred. Documented in docs/releases/0.6.0-scope.md.
- [agent] Root workspace engines raised to node >=22.13 for dev tooling (ESLint 10, Vitest 5); the published library keeps >=18.18, verified by the Consumer CI matrix.
- [agent] Package description and README claim WCAG 2.2 AA with AAA contrast (automated checks), not blanket AAA; manual assistive-technology verification is listed as pending.
- [human] Owner accepted the two moderate dev-only advisories (minimatch inside eslint-plugin-jsx-a11y) for 0.6.0. Owner-reported in chat; the formal security exception is recorded in the hub acceptance record. (Joshua Small, OneSmallEngineering project chat, 2026-11-02T16:52:35Z)

## Constraints

- Never publish to npm or create release tags without the owner; release approval belongs to Joshua Small.
- Every PR targets main; npm scripts must stay cross-platform (Windows).
- Do not run npm audit fix --force or disable audit rules or tests.

## Unresolved decisions

- Page-block (Phase 5) scope needs an owner-written spec before any work.
- Scrollable Popover bodies without focusable content are not keyboard-scrollable in Safari (known limitation, documented).

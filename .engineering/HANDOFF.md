<!-- generated from .engineering/state.json (revision 2) -->

# Handoff: one-small-ui

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 2, `v060-closeout-acceptance-draft`, 2026-11-02T17:10:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

0.6.0 is published and matches 9a13c9e. Read docs/releases/0.6.0-acceptance.md for the facts and the open decision, and ROADMAP.md for future work. Do not republish, retag or implement roadmap items without a scope document.

## Unfinished

- Owner provenance decision (acceptance record section E)
- Owner approval of the closeout PR
- Hub registry PR for 0.6.0 (owner)

## Blockers

- Closing 0.6.0 in the hub needs the owner's provenance decision and approval.

## Decisions

- [agent] No page-block spec existed in the repo, project files or hub, so 0.6.0 was frozen as a hardening release (security, short viewports, compatibility, packaging, docs). Page blocks deferred. Documented in docs/releases/0.6.0-scope.md.
- [agent] Root workspace engines raised to node >=22.13 for dev tooling (ESLint 10, Vitest 5); the published library keeps >=18.18, verified by the Consumer CI matrix.
- [agent] Package description and README claim WCAG 2.2 AA with AAA contrast (automated checks), not blanket AAA; manual assistive-technology verification is listed as pending.

## Constraints

- Never publish to npm or create release tags without the owner; release approval belongs to Joshua Small.
- Every PR targets main; npm scripts must stay cross-platform (Windows).
- Do not run npm audit fix --force or disable audit rules or tests.

## Unresolved decisions

- release-provenance is not met for 0.6.0 (no npm attestation, unsigned tag); owner to choose option A, B or C in docs/releases/0.6.0-acceptance.md section E.
- Hub registry still records 0.5.0 and releaseStatus not_started; needs an owner-approved registry PR.
- Page-block (Phase 5) scope needs an owner-written spec before any work.
- Scrollable Popover bodies without focusable content are not keyboard-scrollable in Safari (known limitation, documented).

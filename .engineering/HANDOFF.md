<!-- generated from .engineering/state.json (revision 3) -->

# Handoff: one-small-ui

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 3, `ci-cd-evidence-pr`, 2026-11-06T00:40:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Read docs/ci-cd.md. The PR from claude/project-thread-mv5bx9 holds the CI/CD work; check its CI and review state on GitHub before continuing. Never publish, tag or change dist-tags; the dry run is safe.

## Unfinished

- PR CI green, independent review, merge
- Post-merge Publish package dry run and docs smoke
- Owner: main ruleset, npm-publish environment, npm trusted publisher
- Owner provenance decision for 0.6.0 (acceptance record section E)

## Blockers

- Branch protection and environment protection need the repository owner.

## Decisions

- [agent] No page-block spec existed in the repo, project files or hub, so 0.6.0 was frozen as a hardening release (security, short viewports, compatibility, packaging, docs). Page blocks deferred. Documented in docs/releases/0.6.0-scope.md.
- [agent] Root workspace engines raised to node >=22.13 for dev tooling (ESLint 10, Vitest 5); the published library keeps >=18.18, verified by the Consumer CI matrix.
- [agent] Package description and README claim WCAG 2.2 AA with AAA contrast (automated checks), not blanket AAA; manual assistive-technology verification is listed as pending.
- [agent] main is protected on one aggregate check, CI gate; publish.yml verifies every mandatory job itself, so job renames can't silently drop a requirement.
- [agent] Releases publish the tarball CI built for the exact candidate, after an independent byte-identical rebuild; no rebuild-and-publish.

## Constraints

- Never publish to npm or create release tags without the owner; release approval belongs to Joshua Small.
- Every PR targets main; npm scripts must stay cross-platform (Windows).
- Do not run npm audit fix --force or disable audit rules or tests.

## Unresolved decisions

- release-provenance is not met for 0.6.0 (no npm attestation, unsigned tag); owner to choose option A, B or C in docs/releases/0.6.0-acceptance.md section E.
- Hub registry still records 0.5.0 and releaseStatus not_started; needs an owner-approved registry PR.
- Page-block (Phase 5) scope needs an owner-written spec before any work.
- Scrollable Popover bodies without focusable content are not keyboard-scrollable in Safari (known limitation, documented).
- main has no branch protection or ruleset; agent tools cannot configure it. Owner: ruleset requiring PRs and the CI gate check, no force push or deletion.
- npm-publish environment protection and the npm trusted publisher (environment npm-publish) are owner settings; not verified.

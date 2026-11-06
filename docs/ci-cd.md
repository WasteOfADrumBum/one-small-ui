# CI/CD

How `@onesmall/ui` is checked, packaged, released and recovered. Workflows live in `.github/workflows/`; the
scripts they run live in `scripts/` and work the same locally (Windows included).

## Workflows

| Workflow | Trigger | What it proves |
| --- | --- | --- |
| `ci.yml` | push to `main`, pull requests, merge queue, manual | The commit is releasable. Ends in one required check, **CI gate**. |
| `codeql.yml` | push to `main`, pull requests, merge queue, weekly, manual | Static analysis of the JS/TS source and of the workflows themselves (security-extended queries). |
| `publish.yml` | manual only | One exact candidate commit is verified, and optionally published (see [Releasing](#releasing)). |
| `docs-smoke.yml` | Vercel production deployment succeeded, manual | The live docs at https://ui.onesmall.company serve the deployed commit and work. Read-only. |
| `dependabot.yml` | weekly | Update PRs for actions and npm, held for 7 days after release (30 for major versions). |

### ci.yml job graph

```
check (ubuntu, windows) ─────────────────────────────────────────────┐
build "Build and package" ─┬─ Playwright (layout) ────────────────────┤
                           ├─ Playwright (a11y)  (uses docs-dist) ────┤
                           └─ Consumer (Node 18/20/22/24) (package) ──┼─ CI gate
Browsers (firefox, webkit) ───────────────────────────────────────────┤
Security ─────────────────────────────────────────────────────────────┘
```

- **check**: `npm run check` (lint with security rules, types, unit and a11y tests, script tests, contrast,
  docs checks). The Windows leg also builds and runs the package checks, so Windows path handling is covered.
- **Build and package**: builds once, then `npm run package:check`, which packs the tarball once and checks it
  (contents allowlist, no source, tests, secrets or install scripts, every export target present, `'use client'`
  banners, size budgets, publint `--strict`, Are the Types Wrong). It uploads `package` (tarball plus
  `package-manifest.json` with the sha256, sha512 integrity, commit, Node/npm versions and run identity) and
  `docs-dist`.
- **Playwright (layout / a11y)**: layout fixtures, and axe on every docs page in both themes plus interactive
  states (open dialog, menu, listbox, popover, invalid form, toast, command palette), forced colors and 320px
  reflow, served with the production security headers from `vercel.json`.
- **Browsers (firefox / webkit)**: `npm run test:browsers` checks native dialog and nested modals, Escape, focus
  containment and return, scroll lock, top-layer popovers, the combobox and menu keyboard patterns and tooltips.
- **Consumer**: installs the exact `package` tarball (sha256 enforced) into clean React 18 and 19 apps on each
  Node version: ESM and CJS imports, SSR, strict type checks with current TypeScript and 5.0, and an esbuild
  production bundle with the stylesheet that must contain one React copy.
- **Security**: `npm run audit:deps` (whole tree and runtime tree; every advisory fails unless listed in
  `security/audit-exceptions.json`), `npm audit signatures`, actionlint, zizmor and gitleaks (full history). The
  tools are pinned and their downloads are checked against sha256 digests in the workflow.
- **CI gate**: runs even when something fails and fails unless every job above succeeded. Protect `main` on this
  one check; job names can change without touching branch protection.

Design rules: every action is pinned to a full commit SHA; workflows default to `contents: read` and grant more
per job; checkouts don't persist credentials; inputs and matrix values reach shell scripts only through `env`;
pull request runs cancel superseded runs, `main` runs never do; every job has a timeout.

## Local commands

```bash
npm run check                 # what the check job runs
npm run build && npm run package:check -- --out artifacts   # build, pack and check the tarball
npm run test:consumer         # consumer apps against a fresh pack (or pass a .tgz and --sha256=<hex>)
npm run test:layout
npm run test:a11y
npm run test:browsers -- --browser=firefox   # after: npx playwright install --with-deps firefox
npm run audit:deps
npm run test:docs-smoke -- https://ui.onesmall.company
```

## Dependency advisories

`npm run audit:deps` fails on any advisory, build tooling included. To accept one, add an entry to
`security/audit-exceptions.json` with `id` (the GHSA id), `package`, `scope` (`dev`, or `runtime` if it reaches
consumers), `rationale`, `owner` and `reviewBy` (a date; the entry fails the build after it). Never run
`npm audit fix --force` to get green.

## Releasing

Publishing needs the maintainer. Agents may run the dry run.

1. Merge the release PR to `main` and wait for **CI gate** and both CodeQL legs on that merge commit.
2. Actions → **Publish package** → Run workflow on `main` with `candidate_sha` (full SHA of the merge commit),
   `expected_version`, and `dry_run` left on.
3. The run, without any registry credentials:
   - validates the inputs and that the candidate is on `main` with matching versions everywhere;
   - finds the candidate's CI and CodeQL runs on `main` through the API and requires the latest attempt of each
     to be complete and green, with every mandatory job present and successful, and the **CI gate** check run to
     come from GitHub Actions for that same run (`scripts/release-verify.mjs`, policy tested in
     `scripts/test/release-lib.test.mjs`);
   - downloads that run's `package` artifact, checks its manifest and digest, rebuilds the candidate with the
     same Node version and requires identical bytes;
   - runs the consumer matrix on that tarball and `npm publish --dry-run`.

   The run summary and the `release-package` artifact (tarball, manifest, `release-evidence.json`, kept 90 days)
   are the evidence for the release record.
4. To publish, run it again with `dry_run` off. The `publish` job runs in the `npm-publish` environment and uses
   npm trusted publishing (OIDC, no token) with provenance, publishes that same tarball, then checks that the
   registry's integrity equals the verified sha512. It never tags, creates releases or changes dist-tags.

One-time owner setup (the workflow can't verify these exist):

- npm: add a trusted publisher for `@onesmall/ui` with repository `WasteOfADrumBum/one-small-ui`, workflow
  `publish.yml`, environment `npm-publish`.
- GitHub: create the `npm-publish` environment with a required reviewer and deployment branches limited to
  `main`. Without it GitHub creates an unprotected environment on first use.
- GitHub: a ruleset on `main` requiring pull requests and the **CI gate** status check, blocking force pushes
  and deletion. `release-verify` reports whether one is present; it warns, it doesn't enforce.

## Docs deployment

Vercel's Git integration builds `apps/docs` on every push. Production deploys from `main`; previews sit behind
Vercel Authentication. The build writes `build-info.json` (package, version, commit) and fails if an inline
script's hash is missing from the Content-Security-Policy in `vercel.json`. After a production deployment,
`docs-smoke.yml` waits until the site serves that commit, then checks security headers, the canonical URL,
representative pages in Chromium (no console errors or failed requests, live examples, anchors, sidebar focus,
not-found page) and that missing files 404.

## Recovery

- **Bad change on `main`**: `git revert -m 1 <merge sha>` in a PR; CI and the docs deploy follow.
- **Docs site broken**: in Vercel, promote the previous production deployment (instant rollback), then fix
  forward. Re-run `docs-smoke.yml` by hand with `expected_sha` to confirm.
- **Failed or flaky CI**: re-run failed jobs. The release check always uses the latest attempt, so a re-run that
  fails after a pass blocks the release until it passes again.
- **Publish failed before `npm publish`**: nothing was published; fix and run again.
- **Publish failed after `npm publish`** (integrity step): compare `npm view @onesmall/ui@<v> dist.integrity`
  with the run's verified integrity before doing anything else.
- **Defective version on npm**: versions are immutable and can't be reused.
  `npm deprecate @onesmall/ui@<bad> "<reason>; use <good>"`, point `latest` back if needed with
  `npm dist-tag add @onesmall/ui@<good> latest` (maintainer), and release a fixed patch.
- **Compromised dependency or action**: pin back in a PR (Dependabot cooldowns give a week of margin), rotate
  anything the job could reach, and check the affected runs' logs.

## Limits

- Real Safari, mobile browsers and assistive technology are not exercised; WebKit and Firefox are Playwright
  engines. Manual screen reader passes remain a release task.
- Only esbuild is tested as a consumer bundler.
- Branch protection and environment protection are repository settings outside the code.

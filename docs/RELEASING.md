# Releasing @onesmall/ui

Publishing, tagging and GitHub releases are done by the maintainer (Joshua Small). Agents and CI prepare
everything up to the publish command and record evidence; they never publish, tag or approve.

## 1. Prepare the candidate (builder)

1. All release PRs merged to `main`; the **CI gate** check and both CodeQL legs green on the candidate commit.
2. Versions match in `package.json`, `packages/onesmallui/package.json` and `apps/docs/package.json`
   (`npm version <x.y.z> -w @onesmall/ui --no-git-tag-version`, then the other two by hand, then `npm install`
   to refresh the lockfile).
3. `packages/onesmallui/CHANGELOG.md`: move `[Unreleased]` to `[x.y.z] - YYYY-MM-DD`.
4. Run the **Publish package** workflow with `dry_run` on (procedure and evidence in [ci-cd.md](ci-cd.md#releasing)).
   It checks the exact candidate's CI, takes the tarball CI built, confirms a rebuild is byte-identical, runs the
   consumer matrix on it and `npm publish --dry-run`. Record the run URL, sha256 and sha512 `integrity` from its
   summary; the integrity is what `npm view @onesmall/ui@x.y.z dist.integrity` must show after publishing.

   The same checks run locally: `npm ci && npm run check && npm run build && npm run package:check`, then
   `npm run test:consumer -- artifacts/onesmall-ui-x.y.z.tgz --sha256=<hex>`.

## 2. Verify (independent verifier)

A person other than the builder checks the evidence and does the manual acceptance checklist in the release
readiness report (keyboard and screen reader passes, docs review). Their result is recorded by them, not by an
agent.

## 3. Publish (maintainer)

Run **Publish package** again on `main` with the same `candidate_sha` and `dry_run` off. It publishes the
verified tarball with npm provenance through trusted publishing (no token) and checks the registry integrity.
The one-time npm and environment setup is in [ci-cd.md](ci-cd.md#releasing). Then tag:

```bash
git tag -s vx.y.z -m "@onesmall/ui x.y.z" <candidate sha> && git verify-tag vx.y.z && git push origin vx.y.z
```

Then create the GitHub release from the tag with the release notes, and confirm:

- `npm view @onesmall/ui@x.y.z dist.integrity` equals the recorded sha512.
- `npm view @onesmall/ui dist-tags.latest` is `x.y.z`.
- A fresh `npm install @onesmall/ui@x.y.z` in a scratch app works (`node scripts/consumer-smoke.mjs` accepts a
  downloaded tarball: `npm pack @onesmall/ui@x.y.z`).

### Provenance (required)

The Engineering Hub's Definition of Done (Tier 2, gate `release-provenance`) requires npm `--provenance` or a
signed tag wherever the channel supports it. npm supports provenance and git supports signed tags, so both apply:

- **Signed tag (minimum):** create the tag with `git tag -s` (GPG or SSH signing key configured, and the key
  added to GitHub) and check it with `git verify-tag vx.y.z`.
- **npm provenance (target):** publish from GitHub Actions with `id-token: write` and `npm publish --provenance`,
  or configure npm trusted publishing for `@onesmall/ui` on npmjs.com for this repository. A local `npm publish`
  cannot attach provenance. Check it with `npm view @onesmall/ui@x.y.z dist.attestations` or
  `npm audit signatures`.

A release without either does not meet the gate, and only Joshua Small can decide to ship it anyway; record that
decision in the release's acceptance record. 0.1.0 to 0.6.0 were published without provenance and with unsigned
tags; see [releases/0.6.0-acceptance.md](releases/0.6.0-acceptance.md). npm attestations can't be added to an
existing version, and released tags are never moved.

## Rollback

npm versions cannot be reused or (after 72 hours) unpublished.

1. `npm deprecate @onesmall/ui@x.y.z "Broken: use x.y.(z+1) or <previous>"`.
2. If needed, point `latest` back: `npm dist-tag add @onesmall/ui@<previous> latest`.
3. Revert the offending merge on `main` (`git revert -m 1 <merge sha>`), release a patch.
4. Consumers pin the previous version: `npm install @onesmall/ui@<previous> --save-exact`.

The docs site deploys from `main` on Vercel; roll it back from the Vercel dashboard (promote the previous
deployment) or by the same revert.

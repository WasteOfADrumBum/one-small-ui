# Releasing @onesmall/ui

Publishing, tagging and GitHub releases are done by the maintainer (Joshua Small). Agents and CI prepare
everything up to the publish command and record evidence; they never publish, tag or approve.

## 1. Prepare the candidate (builder)

1. All release PRs merged to `main`; CI green on the candidate commit (`check` on Ubuntu and Windows,
   `Playwright (layout)`, `Playwright (a11y)`, `Consumer (Node 18|20|22|24)`).
2. Versions match in `package.json`, `packages/onesmallui/package.json` and `apps/docs/package.json`
   (`npm version <x.y.z> -w @onesmall/ui --no-git-tag-version`, then the other two by hand, then `npm install`
   to refresh the lockfile).
3. `packages/onesmallui/CHANGELOG.md`: move `[Unreleased]` to `[x.y.z] - YYYY-MM-DD`.
4. Clean install and full checks:

   ```bash
   npm ci
   npm run check
   npm run build
   npm run test:layout
   npm run test:a11y
   npm audit && npm audit --omit=dev
   ```

5. Pack and record the checksum, then run the consumer test against that exact file:

   ```bash
   npm pack -w @onesmall/ui --pack-destination ./release
   node -e "const c=require('crypto'),f=require('fs').readdirSync('release').find(n=>n.endsWith('.tgz'));console.log(f, c.createHash('sha512').update(require('fs').readFileSync('release/'+f)).digest('base64'), c.createHash('sha256').update(require('fs').readFileSync('release/'+f)).digest('hex'))"
   node scripts/consumer-smoke.mjs release/onesmall-ui-x.y.z.tgz
   npm publish -w @onesmall/ui --dry-run
   ```

   The sha512 (base64) is the `integrity` npm will show after publishing (`npm view @onesmall/ui@x.y.z dist.integrity`).

## 2. Verify (independent verifier)

A person other than the builder checks the evidence and does the manual acceptance checklist in the release
readiness report (keyboard and screen reader passes, docs review). Their result is recorded by them, not by an
agent.

## 3. Publish (maintainer)

```bash
git checkout <candidate sha>
npm ci && npm run build:lib
npm login
npm publish -w @onesmall/ui            # prepublishOnly runs check + build again
git tag -a vx.y.z -m "@onesmall/ui x.y.z" <candidate sha> && git push origin vx.y.z
```

Then create the GitHub release from the tag with the release notes, and confirm:

- `npm view @onesmall/ui@x.y.z dist.integrity` equals the recorded sha512.
- `npm view @onesmall/ui dist-tags.latest` is `x.y.z`.
- A fresh `npm install @onesmall/ui@x.y.z` in a scratch app works (`node scripts/consumer-smoke.mjs` accepts a
  downloaded tarball: `npm pack @onesmall/ui@x.y.z`).

### Provenance (optional, recommended)

npm provenance needs the publish to run in GitHub Actions with `id-token: write` and `npm publish --provenance`
(or npm trusted publishing configured on npmjs.com for this repository). A local `npm publish` cannot attach
provenance. If you want it, add a `workflow_dispatch` release workflow and configure trusted publishing for
`@onesmall/ui` on npmjs.com; until then releases are published without provenance, as 0.1.0 and 0.5.0 were.

## Rollback

npm versions cannot be reused or (after 72 hours) unpublished.

1. `npm deprecate @onesmall/ui@x.y.z "Broken: use x.y.(z+1) or <previous>"`.
2. If needed, point `latest` back: `npm dist-tag add @onesmall/ui@<previous> latest`.
3. Revert the offending merge on `main` (`git revert -m 1 <merge sha>`), release a patch.
4. Consumers pin the previous version: `npm install @onesmall/ui@<previous> --save-exact`.

The docs site deploys from `main` on Vercel; roll it back from the Vercel dashboard (promote the previous
deployment) or by the same revert.

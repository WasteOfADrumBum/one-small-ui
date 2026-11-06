// Runs at the end of the docs build. Writes apps/docs/dist/build-info.json (commit, version) so the docs smoke
// test can prove which commit a deployment serves, and checks that every inline <script> in the built
// index.html is allowed by the Content-Security-Policy hash in vercel.json (editing the theme script without
// updating the CSP would otherwise break the live site silently).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const dist = new URL('../apps/docs/dist/', import.meta.url);
const { version } = JSON.parse(readFileSync(new URL('../packages/onesmallui/package.json', import.meta.url), 'utf8'));
let commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null;
if (!commit) {
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    commit = 'unknown';
  }
}
writeFileSync(new URL('build-info.json', dist), `${JSON.stringify({ package: '@onesmall/ui', version, commit }, null, 2)}\n`);

const html = readFileSync(new URL('index.html', dist), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
const missing = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
  .filter((hash) => !csp.includes(hash));
if (missing.length) {
  console.error(`vercel.json Content-Security-Policy is missing ${missing.join(', ')} for the inline script(s) in index.html.`);
  process.exit(1);
}
console.log(`build-info.json: ${version} @ ${commit}; inline scripts match the CSP`);

// Dependency vulnerability gate. Runs `npm audit` twice: the whole tree (build and test tooling included, since a
// compromised build tool can tamper with what ships) and the runtime tree (`--omit=dev`, what consumers install).
// Every advisory fails unless security/audit-exceptions.json lists it with a scope, rationale, owner and a review
// date that hasn't passed. Never `npm audit fix --force` to make this pass.
//
//   npm run audit:deps
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const win = process.platform === 'win32';
const { exceptions } = JSON.parse(readFileSync(new URL('../security/audit-exceptions.json', import.meta.url), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const failures = [];

for (const e of exceptions) {
  for (const k of ['id', 'package', 'scope', 'rationale', 'owner', 'reviewBy']) if (!e[k]) failures.push(`exception ${e.id ?? '?'} is missing "${k}"`);
  if (e.reviewBy && e.reviewBy < today) failures.push(`exception ${e.id} for ${e.package} expired on ${e.reviewBy}; review it`);
  if (!['dev', 'runtime'].includes(e.scope)) failures.push(`exception ${e.id} has scope "${e.scope}" (dev or runtime)`);
}

function audit(extra) {
  const r = spawnSync('npm', ['audit', '--json', ...extra], { encoding: 'utf8', shell: win, maxBuffer: 32 * 1024 * 1024 });
  let body;
  try {
    body = JSON.parse(r.stdout);
  } catch {
    throw new Error(`npm audit ${extra.join(' ')} did not return JSON (exit ${r.status}):\n${r.stdout}\n${r.stderr}`);
  }
  if (body.error) throw new Error(`npm audit ${extra.join(' ')}: ${JSON.stringify(body.error)}`);
  // Advisories, each with the package it is in.
  const found = [];
  for (const [pkg, v] of Object.entries(body.vulnerabilities ?? {})) {
    for (const via of v.via ?? []) {
      if (typeof via !== 'object') continue;
      const id = String(via.url ?? '').split('/').pop() || String(via.source);
      found.push({ id, package: pkg, severity: via.severity, title: via.title, url: via.url });
    }
  }
  return { meta: body.metadata?.vulnerabilities, found };
}

const runtime = audit(['--omit=dev']);
const all = audit([]);
const runtimeIds = new Set(runtime.found.map((f) => `${f.id}:${f.package}`));
console.log(`npm audit (all dependencies): ${JSON.stringify(all.meta)}`);
console.log(`npm audit (runtime only, --omit=dev): ${JSON.stringify(runtime.meta)}`);

for (const f of all.found) {
  const scope = runtimeIds.has(`${f.id}:${f.package}`) ? 'runtime' : 'dev';
  const ex = exceptions.find((e) => e.id === f.id && e.package === f.package);
  const tag = `${f.severity} ${f.id} in ${f.package} (${scope}): ${f.title}`;
  if (!ex) failures.push(`unreviewed advisory: ${tag} ${f.url}`);
  else if (scope === 'runtime' && ex.scope !== 'runtime') failures.push(`advisory reaches consumers but its exception says dev only: ${tag}`);
  else console.log(`  accepted ${tag} (owner ${ex.owner}, review by ${ex.reviewBy})`);
}
for (const e of exceptions) {
  if (!all.found.some((f) => f.id === e.id && f.package === e.package)) console.log(`  note: exception ${e.id} (${e.package}) no longer matches an advisory; remove it`);
}

for (const f of failures) console.log(`  FAIL ${f}`);
if (failures.length) process.exit(1);
console.log('Dependency audit passed.');

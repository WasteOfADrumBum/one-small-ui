// Packs @onesmall/ui once, validates the tarball, and writes a manifest that binds the artifact to the
// commit and the run that produced it. CI uploads the tarball and manifest; every later job (consumer
// tests, release verification, publication) uses that same file and re-checks its digest.
//
//   npm run build:lib && npm run package:check            # packs into ./artifacts
//   node scripts/package-artifact.mjs --out <dir>          # choose the directory
//   node scripts/package-artifact.mjs --tarball <file.tgz> # validate an existing tarball, don't pack
//
// Checks: publint (strict) and Are the Types Wrong (node16 profile: the advertised `bundler`, `node16` and
// `nodenext` resolution, ESM and CommonJS) on the tarball itself; every `exports` / `main` / `module` /
// `types` target is in the tarball; only the `files` allowlist is published; no private, test or config
// files; no secret-looking strings; size budget; `'use client'` banner on the JS entrypoints.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lib = join(root, 'packages', 'onesmallui');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const outDir = resolve(opt('--out') ?? join(root, 'artifacts'));
const win = process.platform === 'win32';

// Size budget: 0.6.1 packs to about 1.07 MB / 5.0 MB unpacked / 681 files. The budget catches accidental
// additions (source maps of the docs, fixtures, node_modules), not normal growth; raise it deliberately.
const BUDGET = { size: 1_600_000, unpackedSize: 7_000_000, entryCount: 900 };

function run(cmd, cmdArgs, cwd = root) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: 'utf8', shell: win, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`, stdout: r.stdout ?? '' };
}

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${message}`);
};

mkdirSync(outDir, { recursive: true });
let tarball = opt('--tarball');
let packInfo = null;
if (tarball) {
  tarball = resolve(tarball);
} else {
  if (!existsSync(join(lib, 'dist', 'index.js'))) throw new Error('Build the library first: npm run build:lib');
  for (const f of readdirSync(outDir)) if (f.endsWith('.tgz')) rmSync(join(outDir, f));
  const r = run('npm', ['pack', '--json', '--pack-destination', outDir], lib);
  if (!r.ok) throw new Error(`npm pack failed\n${r.out}`);
  packInfo = JSON.parse(r.stdout)[0];
  tarball = join(outDir, packInfo.filename);
}
const bytes = readFileSync(tarball);
const sha256 = createHash('sha256').update(bytes).digest('hex');
const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
console.log(`Package artifact ${tarball}\n  sha256 ${sha256}\n  ${integrity}`);
if (packInfo) check(packInfo.integrity === integrity, 'integrity matches what npm pack reported');

// ---------- Contents ----------
const unpacked = mkdtempSync(join(tmpdir(), 'os-artifact-'));
const tar = run('tar', ['-xzf', tarball, '-C', unpacked]);
if (!tar.ok) throw new Error(`tar failed\n${tar.out}`);
const pkgRoot = join(unpacked, 'package');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const files = walk(pkgRoot).map((f) => relative(pkgRoot, f).split('\\').join('/'));
const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'));
const workspacePkg = JSON.parse(readFileSync(join(lib, 'package.json'), 'utf8'));
const unpackedSize = files.reduce((n, f) => n + statSync(join(pkgRoot, f)).size, 0);

check(pkg.name === '@onesmall/ui', `package name is @onesmall/ui (${pkg.name})`);
check(pkg.version === workspacePkg.version, `tarball version ${pkg.version} matches the workspace (${workspacePkg.version})`);
check(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(pkg.version), `version ${pkg.version} is semver`);
check(!pkg.dependencies || Object.keys(pkg.dependencies).length === 0, 'no runtime dependencies');
check(pkg.peerDependencies?.react && pkg.peerDependencies?.['react-dom'], 'react and react-dom are peer dependencies');
check(!pkg.scripts?.install && !pkg.scripts?.postinstall && !pkg.scripts?.preinstall, 'no install scripts');

const allowedTop = new Set([...(pkg.files ?? []).map((f) => f.replace(/\/$/, '')), 'package.json', 'README.md', 'LICENSE']);
const outside = files.filter((f) => !allowedTop.has(f.split('/')[0]));
check(outside.length === 0, `only the "files" allowlist is published${outside.length ? `: ${outside.slice(0, 5).join(', ')}` : ''}`);
const forbidden = files.filter(
  (f) =>
    /(^|\/)(test|tests|src|node_modules|coverage|playwright-report|\.github|\.engineering|\.vscode)\//.test(f) ||
    /(^|\/)(\.env.*|\.npmrc|\.DS_Store|tsconfig.*\.json|vite\..*config.*|vitest\.config.*|eslint\.config.*|rollup.*config.*)$/.test(f) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(f) ||
    /\.(tsbuildinfo|log|tgz|pem|key|p12)$/.test(f),
);
check(forbidden.length === 0, `no test, source, config, private or temporary files${forbidden.length ? `: ${forbidden.slice(0, 5).join(', ')}` : ''}`);

// Secret-looking strings in any text file (npm, GitHub, AWS, Slack tokens; private keys).
const secretPatterns = [
  /npm_[A-Za-z0-9]{36}/,
  /gh[pousr]_[A-Za-z0-9]{36,}/,
  /github_pat_[A-Za-z0-9_]{60,}/,
  /AKIA[0-9A-Z]{16}/,
  /xox[abprs]-[A-Za-z0-9-]{10,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\/\/registry\.npmjs\.org\/:_authToken=/,
];
const secretHits = [];
for (const f of files) {
  if (/\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot)$/.test(f)) continue;
  const text = readFileSync(join(pkgRoot, f), 'utf8');
  for (const re of secretPatterns) if (re.test(text)) secretHits.push(`${f} (${re.source.slice(0, 20)})`);
}
check(secretHits.length === 0, `no secret-looking strings${secretHits.length ? `: ${secretHits.join(', ')}` : ''}`);

// Every target named in exports / main / module / types exists in the tarball.
const targets = new Set([pkg.main, pkg.module, pkg.types].filter(Boolean));
const collect = (v) => {
  if (typeof v === 'string') targets.add(v);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
collect(pkg.exports);
const missing = [];
for (const t of targets) {
  const rel = t.replace(/^\.\//, '');
  if (rel.includes('*')) {
    const prefix = rel.slice(0, rel.indexOf('*'));
    if (!files.some((f) => f.startsWith(prefix))) missing.push(t);
  } else if (!files.includes(rel)) missing.push(t);
}
check(missing.length === 0, `all ${targets.size} exports/main/module/types targets are in the tarball${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
for (const entry of ['dist/index.js', 'dist/index.cjs', 'dist/icons.js', 'dist/icons.cjs']) {
  const head = existsSync(join(pkgRoot, entry)) ? readFileSync(join(pkgRoot, entry), 'utf8').slice(0, 40) : '';
  check(/^["']use client["'];/.test(head), `${entry} starts with the 'use client' directive`);
}

const size = bytes.length;
check(size <= BUDGET.size, `tarball ${(size / 1e6).toFixed(2)} MB within ${(BUDGET.size / 1e6).toFixed(1)} MB budget`);
check(unpackedSize <= BUDGET.unpackedSize, `unpacked ${(unpackedSize / 1e6).toFixed(2)} MB within ${(BUDGET.unpackedSize / 1e6).toFixed(1)} MB budget`);
check(files.length <= BUDGET.entryCount, `${files.length} files within ${BUDGET.entryCount} budget`);

// ---------- Maintained validators, run on the tarball ----------
const publint = run('npx', ['--no-install', 'publint', 'run', tarball, '--strict']);
check(publint.ok && /All good/.test(publint.out), `publint --strict${publint.ok ? '' : `\n${publint.out}`}`);
const attw = run('npx', ['--no-install', 'attw', tarball, '--profile', 'node16', '--entrypoints', '.', './icons', './dom', './tokens.json', './package.json', '--format', 'ascii', '--no-color']);
check(attw.ok, `Are the Types Wrong (node16 profile: bundler, node16 ESM and CJS)${attw.ok ? '' : `\n${attw.out}`}`);
rmSync(unpacked, { recursive: true, force: true });

// ---------- Manifest ----------
const git = run('git', ['rev-parse', 'HEAD']);
const npmVersion = run('npm', ['--version']).stdout.trim();
const manifest = {
  schema: 1,
  package: pkg.name,
  version: pkg.version,
  filename: tarball.split(/[\\/]/).pop(),
  sha256,
  integrity,
  size,
  unpackedSize,
  entryCount: files.length,
  commit: process.env.GITHUB_SHA || (git.ok ? git.stdout.trim() : null),
  build: { node: process.version, npm: npmVersion, os: process.platform },
  run: process.env.GITHUB_RUN_ID
    ? {
        repository: process.env.GITHUB_REPOSITORY,
        workflow: process.env.GITHUB_WORKFLOW_REF,
        id: process.env.GITHUB_RUN_ID,
        attempt: process.env.GITHUB_RUN_ATTEMPT,
        event: process.env.GITHUB_EVENT_NAME,
      }
    : null,
  checks: failures.length ? 'failed' : 'passed',
};
writeFileSync(join(outDir, 'package-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nManifest ${join(outDir, 'package-manifest.json')}`);
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Package artifact\n\n| | |\n| --- | --- |\n| Package | \`${pkg.name}@${pkg.version}\` |\n| File | \`${manifest.filename}\` |\n| sha256 | \`${sha256}\` |\n| integrity | \`${integrity}\` |\n| Commit | \`${manifest.commit}\` |\n| Built with | Node ${process.version}, npm ${npmVersion} |\n| Checks | ${manifest.checks} |\n`,
    { flag: 'a' },
  );
}
if (failures.length) {
  console.log(`\n${failures.length} package check(s) failed.`);
  process.exit(1);
}
console.log('\nPackage artifact checks passed.');

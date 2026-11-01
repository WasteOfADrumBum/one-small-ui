// Installs the packed @onesmall/ui tarball into clean, throwaway apps (one per React major) and checks what
// a consumer relies on: ESM and CommonJS entrypoints, the icons / dom / tokens subpaths, CSS and SCSS, type
// declarations (bundler and node16 resolution), server rendering and hydration without mismatches, a single
// React copy, and that no development or private files are published.
//
//   node scripts/consumer-smoke.mjs [path/to/onesmall-ui-x.y.z.tgz] [--react=18,19]
//
// Without a tarball it packs packages/onesmallui (run `npm run build:lib` first). Needs network access for
// npm install. Works on Node 18+ so CI can run it on every Node version the package supports at runtime.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lib = join(root, 'packages', 'onesmallui');
const args = process.argv.slice(2);
const reactArg = args.find((a) => a.startsWith('--react='));
const majors = reactArg ? reactArg.slice(8).split(',') : ['18', '19'];
const keep = args.includes('--keep');
let tarball = args.find((a) => a.endsWith('.tgz'));

const win = process.platform === 'win32';
function run(cmd, cmdArgs, cwd, { quiet = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: 'utf8', shell: win, env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' } });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${cmdArgs.join(' ')} failed in ${cwd}\n${r.stdout}\n${r.stderr}`);
  }
  if (!quiet && r.stderr.trim()) process.stderr.write(r.stderr);
  return r.stdout;
}

if (!tarball) {
  if (!existsSync(join(lib, 'dist', 'index.js'))) throw new Error('Build the library first: npm run build:lib');
  const out = mkdtempSync(join(tmpdir(), 'os-pack-'));
  const json = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', out], lib, { quiet: true }));
  tarball = join(out, json[0].filename);
}
tarball = resolve(tarball);
console.log(`Node ${process.version} · tarball ${tarball}`);

const failures = [];
let passed = 0;
const check = (ok, message) => {
  if (ok) passed++;
  else failures.push(message);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${message}`);
};

// ---------- Files in the artifact ----------
const listing = run('tar', ['-tzf', tarball], root, { quiet: true }).split(/\r?\n/).filter(Boolean);
const forbidden = listing.filter((f) => /(^|\/)(test|src|node_modules|\.engineering|\.github|coverage|playwright-report)\/|\.test\.|\.env|tsconfig|vite\..*config|eslint\.config|\.map$/.test(f.replace(/^package\//, '')) && !f.endsWith('.js.map') && !f.endsWith('.cjs.map'));
check(forbidden.length === 0, `artifact has no test, source, config or private files${forbidden.length ? `: ${forbidden.slice(0, 5).join(', ')}` : ''}`);
for (const f of ['package/package.json', 'package/README.md', 'package/LICENSE', 'package/CHANGELOG.md', 'package/dist/index.js', 'package/dist/index.cjs', 'package/dist/index.d.ts', 'package/dist/index.d.cts', 'package/dist/onesmallui.css', 'package/dist/onesmallui.min.css', 'package/scss/index.scss', 'package/tokens/themes.json', 'package/agent/SKILL.md']) {
  check(listing.includes(f), `artifact contains ${f.replace('package/', '')}`);
}

const typesFor = { 18: '^18', 19: '^19' };
const jsdomRange = Number(process.versions.node.split('.')[0]) >= 20 ? '^26' : '^24';

for (const major of majors) {
  console.log(`\nReact ${major}`);
  const app = mkdtempSync(join(tmpdir(), `os-consumer-r${major}-`));
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: `consumer-r${major}`, private: true, version: '0.0.0' }, null, 2));
  run('npm', ['install', '--no-package-lock', '--loglevel=error', tarball, `react@${major}`, `react-dom@${major}`, `@types/react@${typesFor[major]}`, `@types/react-dom@${typesFor[major]}`, 'typescript@~5.9', `jsdom@${jsdomRange}`, 'sass', 'esbuild'], app);

  const installed = JSON.parse(readFileSync(join(app, 'node_modules', 'react', 'package.json'), 'utf8')).version;
  check(installed.startsWith(`${major}.`), `installs beside react ${installed} with no peer conflict`);
  const reactCopies = run('npm', ['ls', 'react', '--all', '--parseable'], app, { quiet: true }).split(/\r?\n/).filter((l) => /node_modules[\\/]react$/.test(l));
  check(reactCopies.length === 1, `one React copy (${reactCopies.length} found)`);

  // ESM: every subpath, server rendering of representative components, providers, overlays and hooks.
  writeFileSync(
    join(app, 'esm.mjs'),
    `import * as ui from '@onesmall/ui';
import * as icons from '@onesmall/ui/icons';
import * as dom from '@onesmall/ui/dom';
import { createRequire } from 'node:module';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
const require = createRequire(import.meta.url);
const tokens = require('@onesmall/ui/tokens.json');
const out = { warnings: [] };
// React 18 warns on stderr for things React 19 accepts silently (useLayoutEffect during SSR, say).
console.error = console.warn = (...a) => out.warnings.push(a.map(String).join(' ').slice(0, 200));
out.exports = Object.keys(ui).length;
out.icons = Object.keys(icons).filter((k) => k.endsWith('Icon')).length;
out.dom = typeof dom.init === 'function' || Object.keys(dom).length > 0;
out.tokens = Object.keys(tokens).filter((k) => k !== 'motion').length;
const tree = h(ui.AnnouncerProvider, null,
  h(ui.ToastProvider, null,
    h(ui.Button, { variant: 'solid' }, 'Launch'),
    h(ui.Field, { label: 'Name' }, h(ui.Input, { name: 'n' })),
    h(ui.Combobox, { 'aria-label': 'Planet', options: [{ value: 'mars', label: 'Mars' }] }),
    h(ui.Tooltip, { content: 'Tip' }, h('button', null, 'T')),
    h(ui.Dialog, { open: false, onClose() {}, title: 'D' }, 'body'),
    h(ui.Popover, { content: 'P' }, h('button', null, 'P')),
    h(ui.Accordion, null, h(ui.AccordionItem, { value: 'a', title: 'A' }, 'a')),
    h(ui.Rating, { 'aria-label': 'Score', defaultValue: 3 }),
    h(ui.Kbd, { combo: 'Mod+K' }),
    h(icons.CheckIcon, null),
  ));
out.html = renderToString(tree).length;
console.log(JSON.stringify(out));
`,
  );
  let esm;
  try {
    esm = JSON.parse(run('node', ['esm.mjs'], app, { quiet: true }).trim().split('\n').pop());
  } catch (e) {
    check(false, `ESM import and server render: ${String(e.message).slice(0, 600)}`);
  }
  if (esm) {
    check(esm.exports > 100, `ESM: ${esm.exports} exports from @onesmall/ui`);
    check(esm.icons >= 40, `ESM: ${esm.icons} icons from @onesmall/ui/icons`);
    check(esm.dom, 'ESM: @onesmall/ui/dom imports without a DOM');
    check(esm.tokens >= 2, `tokens.json: ${esm.tokens} themes`);
    check(esm.html > 500, `SSR: renderToString of providers, overlays and controls (${esm.html} chars)`);
    check(esm.warnings.length === 0, `SSR: no React warnings while server rendering${esm.warnings.length ? `: ${esm.warnings.join(' | ')}` : ''}`);
  }

  // CommonJS.
  writeFileSync(
    join(app, 'cjs.cjs'),
    `const ui = require('@onesmall/ui');
const icons = require('@onesmall/ui/icons');
const dom = require('@onesmall/ui/dom');
const { createElement: h } = require('react');
const { renderToString } = require('react-dom/server');
const html = renderToString(h(ui.Alert, { color: 'success', title: 'Ok' }, h(icons.CheckIcon)));
console.log(JSON.stringify({ exports: Object.keys(ui).length, icons: Object.keys(icons).length, dom: Object.keys(dom).length, html: html.length, same: require('react') === require(require.resolve('react', { paths: [require.resolve('@onesmall/ui')] })) }));
`,
  );
  try {
    const cjs = JSON.parse(run('node', ['cjs.cjs'], app, { quiet: true }).trim().split('\n').pop());
    check(cjs.exports === esm?.exports, `CJS: ${cjs.exports} exports (ESM ${esm?.exports})`);
    check(cjs.icons > 0 && cjs.dom > 0 && cjs.html > 50, 'CJS: icons, dom and server render');
    check(cjs.same, 'CJS: the library resolves the app\'s React');
  } catch (e) {
    check(false, `CJS require: ${String(e.message).slice(0, 600)}`);
  }

  // Hydration in jsdom: server HTML hydrated by the client build, with no recoverable errors or warnings.
  writeFileSync(
    join(app, 'hydrate.mjs'),
    `import { JSDOM } from 'jsdom';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
const tree = (ui) => h(ui.AnnouncerProvider, null, h(ui.ToastProvider, null,
  h(ui.Field, { label: 'Name' }, h(ui.Input, { name: 'n' })),
  h(ui.Accordion, null, h(ui.AccordionItem, { value: 'a', title: 'A' }, 'a')),
  h(ui.Tooltip, { content: 'Tip' }, h('button', null, 'T')),
  h(ui.Kbd, { combo: 'Mod+K' }),
  h(ui.Timeline, null, h(ui.TimelineItem, { title: 'Launch', time: '2026-10-09' })),
));
const problems = [];
console.error = console.warn = (...a) => { problems.push(a.map(String).join(' ').slice(0, 300)); };
const ui = await import('@onesmall/ui');
const html = renderToString(tree(ui));
const { window: win } = new JSDOM('<!doctype html><div id="root">' + html + '</div>', { pretendToBeVisual: true, url: 'http://localhost/' });
win.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const define = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
define('window', win);
for (const k of ['document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Element', 'Node', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'localStorage']) define(k, win[k]);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { hydrateRoot } = await import('react-dom/client');
const { act } = await import('react');
await (act ?? ((f) => f()))(async () => {
  hydrateRoot(document.getElementById('root'), tree(ui), { onRecoverableError: (e) => problems.push('recoverable: ' + e.message) });
});
console.log(JSON.stringify({ problems }));
`,
  );
  try {
    const hyd = JSON.parse(run('node', ['hydrate.mjs'], app, { quiet: true }).trim().split('\n').pop());
    check(hyd.problems.length === 0, `hydration with no errors or mismatches${hyd.problems.length ? `: ${hyd.problems.join(' | ')}` : ''}`);
  } catch (e) {
    check(false, `hydration: ${String(e.message).slice(0, 600)}`);
  }

  // Types: bundler (import condition, .d.ts) and node16 CommonJS (require condition, .d.cts).
  writeFileSync(
    join(app, 'app.tsx'),
    `import { Button, Dialog, Combobox, useDisclosure, type ButtonProps, type ComboboxOption } from '@onesmall/ui';
import { CheckIcon } from '@onesmall/ui/icons';
import { themes, motion } from '@onesmall/ui';
const opts: ComboboxOption[] = [{ value: 'a', label: 'A' }];
const props: ButtonProps = { variant: 'outline', size: 'sm' };
export function App() {
  const d = useDisclosure();
  const ms: number = motion.duration.fast;
  void themes; void ms;
  return (<>
    <Button {...props} onClick={d.open}><CheckIcon /> Open</Button>
    <Dialog open={d.isOpen} onClose={d.close} title="T">x</Dialog>
    <Combobox options={opts} aria-label="C" />
  </>);
}
// @ts-expect-error unknown prop must be rejected
export const bad = <Button notAProp />;
`,
  );
  mkdirSync(join(app, 'cts'), { recursive: true });
  writeFileSync(join(app, 'cts', 'app.cts'), `import ui = require('@onesmall/ui');\nimport icons = require('@onesmall/ui/icons');\nconst b: typeof ui.Button = ui.Button;\nvoid b; void icons.CheckIcon;\n`);
  const tsBase = { strict: true, skipLibCheck: false, noEmit: true, jsx: 'react-jsx', target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], types: [] };
  writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({ compilerOptions: { ...tsBase, module: 'ESNext', moduleResolution: 'bundler' }, files: ['app.tsx'] }));
  writeFileSync(join(app, 'tsconfig.node16.json'), JSON.stringify({ compilerOptions: { ...tsBase, module: 'node16', moduleResolution: 'node16' }, files: ['cts/app.cts'] }));
  for (const [cfg, label] of [['tsconfig.json', 'bundler resolution (.d.ts)'], ['tsconfig.node16.json', 'node16 CommonJS resolution (.d.cts)']]) {
    try {
      run('npx', ['tsc', '-p', cfg], app, { quiet: true });
      check(true, `types: ${label}, strict, skipLibCheck off`);
    } catch (e) {
      check(false, `types: ${label}: ${String(e.message).slice(0, 900)}`);
    }
  }

  // CSS and SCSS entrypoints.
  const cssPath = join(app, 'node_modules', '@onesmall', 'ui', 'dist', 'onesmallui.css');
  const css = readFileSync(cssPath, 'utf8');
  check(css.includes('.os-btn') && css.includes('--os-primary') && !/url\(["']?\.\.?\//.test(css), 'styles.css: components and tokens, no relative asset URLs');
  writeFileSync(join(app, 'app.scss'), `@use '@onesmall/ui/scss';\n.x { color: red; }\n`);
  try {
    run('npx', ['sass', '--load-path=node_modules', '--pkg-importer=node', 'app.scss', 'out.css'], app, { quiet: true });
    const out = readFileSync(join(app, 'out.css'), 'utf8');
    check(out.includes('.os-btn') && out.includes('.x'), 'SCSS: @use "@onesmall/ui/scss" compiles in a consumer');
  } catch (e) {
    check(false, `SCSS: ${String(e.message).slice(0, 600)}`);
  }

  // Tree shaking: a bundle that imports only Button must not carry the rest of the library.
  writeFileSync(join(app, 'one.mjs'), `import { Button } from '@onesmall/ui';\nexport { Button };\n`);
  writeFileSync(join(app, 'all.mjs'), `export * from '@onesmall/ui';\n`);
  try {
    const size = (entry) => {
      run('npx', ['esbuild', entry, '--bundle', '--minify', '--format=esm', '--platform=browser', '--external:react', '--external:react-dom', '--external:react/jsx-runtime', `--outfile=${entry}.out.js`, '--log-level=error'], app, { quiet: true });
      return readFileSync(join(app, `${entry}.out.js`), 'utf8');
    };
    const one = size('one.mjs');
    const all = size('all.mjs');
    check(one.length * 10 < all.length && !one.includes('lightbox'), `tree shaking: Button alone is ${(one.length / 1024).toFixed(1)} kB of ${(all.length / 1024).toFixed(1)} kB (minified, React external)`);
  } catch (e) {
    check(false, `tree shaking: ${String(e.message).slice(0, 600)}`);
  }

  if (!keep) rmSync(app, { recursive: true, force: true });
  else console.log(`  kept ${app}`);
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}

// Read-only smoke test of a deployed docs site. Requests pages and assets; changes nothing.
//
//   npm run test:docs-smoke -- https://ui.onesmall.company [--sha <commit>] [--wait 600]
//
// With --sha it first waits (bounded) until /build-info.json reports that commit, so it checks the deployment
// that was just made, not the previous one. Then: security headers and canonical URL, the home page and
// representative component routes render without console errors or failed same-origin requests, sidebar
// navigation works, in-page links resolve, an unknown route shows the not-found page, and a missing file 404s.
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const raw = args.find((a) => /^https:\/\//.test(a));
if (!raw) throw new Error('usage: docs-smoke.mjs https://host [--sha <commit>] [--wait <seconds>]');
const base = new URL(raw);
// Only the project's own hosts: the URL can come from a deployment event.
if (!/^(ui\.onesmall\.company|one-small-ui(-[a-z0-9-]+)?\.vercel\.app)$/.test(base.hostname) || base.protocol !== 'https:') {
  throw new Error(`refusing to test ${base.origin}: not a docs host of this project`);
}
const origin = base.origin;
const sha = opt('sha');
if (sha && !/^[0-9a-f]{40}$/.test(sha)) throw new Error('--sha must be a full commit SHA');
const waitSeconds = Math.min(Number(opt('wait') ?? 600), 1800);

const failures = [];
let passed = 0;
const check = (ok, message) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (ok) passed++;
  else failures.push(message);
};
const get = (path, init) => fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(20_000), ...init });

// ---------- The deployment under test ----------
let info = null;
const deadline = Date.now() + waitSeconds * 1000;
for (let attempt = 1; ; attempt++) {
  try {
    const res = await get(`/build-info.json?t=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } });
    info = res.ok ? await res.json() : null;
  } catch {
    info = null;
  }
  if (!sha || info?.commit === sha || Date.now() > deadline) break;
  console.log(`  ..   ${origin} serves ${info?.commit ?? 'no build-info'}; waiting for ${sha} (attempt ${attempt})`);
  await new Promise((r) => setTimeout(r, Math.min(15_000 * attempt, 60_000)));
}
check(!!info, `build-info.json is served (${info ? `${info.package}@${info.version} @ ${info.commit}` : 'missing'})`);
if (sha) check(info?.commit === sha, `deployment serves commit ${sha}`);

// ---------- Headers and document ----------
const home = await get('/');
const html = await home.text();
check(home.status === 200, `home responds 200 (${home.status})`);
const h = (k) => home.headers.get(k) ?? '';
check(/max-age=\d{7,}/.test(h('strict-transport-security')), `Strict-Transport-Security (${h('strict-transport-security')})`);
check(h('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff');
check(/frame-ancestors 'none'/.test(h('content-security-policy')) || h('x-frame-options') === 'DENY', 'framing is denied');
check(/script-src 'self'/.test(h('content-security-policy')) && !/script-src[^;]*'unsafe-inline'/.test(h('content-security-policy')), 'Content-Security-Policy restricts scripts (no unsafe-inline)');
check(!!h('referrer-policy'), `Referrer-Policy (${h('referrer-policy')})`);
check(/<link rel="canonical" href="https:\/\/ui\.onesmall\.company\/"/.test(html), 'canonical URL is https://ui.onesmall.company/');
const missing = await get('/does-not-exist-smoke-check.js');
check(missing.status === 404, `a missing file returns 404 (${missing.status})`);
for (const path of ['/llms.txt', '/components.json']) {
  const r = await get(path);
  check(r.status === 200, `${path} is served (${r.status})`);
}

// ---------- In the browser ----------
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
const failed = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text().slice(0, 200)));
page.on('requestfailed', (r) => r.url().startsWith(origin) && failed.push(`${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => r.url().startsWith(origin) && r.status() >= 400 && failed.push(`${r.url()} ${r.status()}`));

const routes = [
  ['home', null],
  ['getting-started', 'Getting started'],
  ['components/button', 'Button'],
  ['components/dialog', 'Dialog'],
  ['components/combobox', 'Combobox'],
  ['components/data-table', 'DataTable'],
];
for (const [route, heading] of routes) {
  errors.length = 0;
  failed.length = 0;
  await page.goto(`${origin}/#${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
  const state = await page.evaluate(() => ({
    h1: document.querySelector('main h1')?.textContent?.trim() ?? '',
    css: [...document.styleSheets].some((s) => s.href?.includes('/assets/') && s.cssRules.length > 0),
    examples: document.querySelectorAll('.docs-example').length,
    broken: [...document.querySelectorAll('main a[href^="#"]')]
      .map((a) => a.getAttribute('href').slice(1))
      .filter((h) => h && !h.includes('/') && !['home', 'getting-started', 'theming', 'utilities', 'accessibility', 'main'].includes(h) && !document.getElementById(h)),
  }));
  check(heading ? state.h1.toLowerCase().includes(heading.toLowerCase()) : state.h1.length > 0, `#${route} renders its heading ("${state.h1.slice(0, 40)}")`);
  check(state.css, `#${route} has the site stylesheet`);
  if (route.startsWith('components/')) check(state.examples > 0, `#${route} renders live examples (${state.examples})`);
  check(state.broken.length === 0, `#${route} in-page anchors resolve${state.broken.length ? `: ${state.broken.join(', ')}` : ''}`);
  check(errors.length === 0, `#${route} has no console errors${errors.length ? `: ${errors.slice(0, 2).join(' | ')}` : ''}`);
  check(failed.length === 0, `#${route} loads every same-origin asset${failed.length ? `: ${failed.slice(0, 2).join(' | ')}` : ''}`);
}

// Sidebar navigation moves to the page and focuses its heading.
await page.goto(`${origin}/#home`, { waitUntil: 'networkidle' });
await page.locator('.docs-sidebar a[href="#components/tabs"]').first().click();
await page.waitForFunction(() => document.querySelector('main h1')?.textContent?.includes('Tabs'), null, { timeout: 10_000 }).catch(() => {});
const nav = await page.evaluate(() => ({ h1: document.querySelector('main h1')?.textContent, focused: document.activeElement?.tagName, current: document.querySelector('.docs-sidebar a[aria-current="page"]')?.getAttribute('href') }));
check(nav.h1?.includes('Tabs') && nav.focused === 'H1' && nav.current === '#components/tabs', `sidebar navigation (${JSON.stringify(nav)})`);

// Unknown component route: a usable not-found page with a way back.
await page.goto(`${origin}/#components/no-such-component`, { waitUntil: 'networkidle' });
const nf = await page.evaluate(() => ({ h1: document.querySelector('main h1')?.textContent, home: !!document.querySelector('main a[href="#home"]'), title: document.title }));
check(nf.h1 === 'Page not found' && nf.home, `unknown route shows the not-found page (${JSON.stringify(nf)})`);

await browser.close();
console.log(`\n${origin}: ${passed} passed, ${failures.length} failed`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Docs smoke: ${origin}\n\nCommit: \`${/^[0-9a-f]{40}$/.test(info?.commit ?? '') ? info.commit : 'unknown'}\` · ${passed} passed, ${failures.length} failed\n${failures.map((f) => `- ❌ ${f.replace(/[\r\n`<>]/g, ' ')}`).join('\n')}\n`);
}
process.exit(failures.length ? 1 : 0);

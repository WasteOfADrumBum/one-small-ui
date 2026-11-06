// Runs axe-core (WCAG 2.x A, AA and AAA rules) against every docs page in
// light and dark themes, using the built docs site in apps/docs/dist, served with the production
// response headers from vercel.json (so a Content-Security-Policy violation fails as a console error).
// Then checks interactive states (open dialog, menu, listbox, popover, invalid form, toast, command
// palette), keyboard focus visibility in forced-colors mode, and reflow at 320 CSS px.
// Automated checks only: zero violations here is not WCAG conformance (see docs/ci-cd.md).
//   npm run build && npm run test:a11y
//   SCREENSHOTS=./shots npm run test:a11y   # also save screenshots
//   ROUTES=button,menu npm run test:a11y    # only routes containing these strings
import { createServer } from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { writeReport } from './report-lib.mjs';

const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const root = fileURLToPath(new URL('../apps/docs/dist/', import.meta.url));
if (!existsSync(root)) {
  console.error('Build the docs first: npm run build');
  process.exit(1);
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain' };
const vercel = JSON.parse(await readFile(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'));
// The catch-all header rule (CSP and friends); upgrade-insecure-requests is dropped for the http test server.
const prodHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value.replace(/;\s*upgrade-insecure-requests/, '')]),
);
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(root, path === '/' ? 'index.html' : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { ...prodHeaders, 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

// Every docs page: the guides plus one route per file in apps/docs/src/docs/.
const docsDir = fileURLToPath(new URL('../apps/docs/src/docs/', import.meta.url));
const slugs = (await readdir(docsDir)).filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, ''));
const routes = [
  'home', 'getting-started', 'theming', 'utilities', 'accessibility',
  ...slugs.map((s) => `components/${s}`),
].filter((r) => !process.env.ROUTES || process.env.ROUTES.split(',').some((x) => r.includes(x)));

const shots = process.env.SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });

const browser = await chromium.launch({
  // PW_CHROMIUM_PATH points at a preinstalled Chromium (sandboxes without `playwright install`).
  executablePath: process.env.PW_CHROMIUM_PATH || undefined,
});
let total = 0;
const reportItems = [];
const axeTags = ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// A page that records console errors and uncaught exceptions (both count as failures). Network failures for
// remote example images depend on the runner's network, so they are not counted.
async function openPage(options, theme) {
  const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce', viewport: { width: 1280, height: 900 }, ...options });
  const page = await context.newPage();
  await page.addInitScript((t) => localStorage.setItem('onesmallui-theme', t), theme);
  const state = { page, context, errors: [] };
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && state.errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => state.errors.push(String(e.message).slice(0, 200)));
  return state;
}

// axe on the current page state; returns the lines to print and the failure count.
async function audit(state, tag, extra = []) {
  const { page } = state;
  const lines = [];
  let count = 0;
  // Errors the page produced before axe runs count. axe itself is injected with evaluate (an injected
  // <script> would be an inline script the CSP rightly blocks) and fetches stylesheets for its CSSOM rules,
  // which the CSP's connect-src blocks; errors raised while axe runs are the tool's, so they are dropped.
  const pageErrors = [...state.errors];
  await page.evaluate(axeSource);
  const result = await page.evaluate((values) =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: 'tag', values } }),
  axeTags);
  state.errors = pageErrors;
  // Known axe false positive: an expanded APG tree item nests its child group, so axe counts the
  // children's text as the item's visible label. The row label (aria-labelledby) is the whole visible
  // label and is the accessible name, so WCAG 2.5.3 holds (test/tree-view.test.tsx asserts the name).
  // Only this rule on these nodes is dropped.
  const violations = result.violations
    .map((v) =>
      v.id === 'label-content-name-mismatch'
        ? { ...v, nodes: v.nodes.filter((n) => !n.html.startsWith('<li role="treeitem"')) }
        : v,
    )
    .filter((v) => v.nodes.length > 0);
  count += violations.length;
  for (const err of state.errors) {
    count++;
    lines.push(`  FAIL ${tag}: console error — ${err}`);
  }
  state.errors = [];
  for (const msg of extra) {
    count++;
    lines.push(`  FAIL ${tag}: ${msg}`);
  }
  if (count === 0) lines.push(`  ok   ${tag}`);
  for (const v of violations) {
    lines.push(`  FAIL ${tag}: [${v.impact}] ${v.id} — ${v.help}`);
    for (const n of v.nodes.slice(0, 3)) lines.push(`         ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1] ?? ''}`);
  }
  if (count) {
    reportItems.push({
      title: tag,
      details: [...extra, ...violations.flatMap((v) => [`[${v.impact}] ${v.id}: ${v.help}`, ...v.nodes.slice(0, 5).map((n) => `  ${n.target.join(' ')}`)])],
      screenshot: await page.screenshot({ fullPage: true }),
    });
  }
  return { lines, count };
}

// Every route in one theme. Both themes run at once in separate contexts (about half the wall time).
async function auditTheme(theme) {
  const state = await openPage({}, theme);
  const { page } = state;
  const out = [];
  let count = 0;
  for (const route of routes) {
    await page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    // In-page links must point at a route or an element that exists.
    const brokenLinks = await page.evaluate((known) =>
      Array.from(document.querySelectorAll('a[href^="#"]'))
        .map((a) => a.getAttribute('href').slice(1).split('?')[0])
        .filter((h) => h && !known.includes(h) && !known.includes(h.split('/').slice(0, 2).join('/')) && !document.getElementById(h) && !document.getElementById(decodeURIComponent(h))),
    routes);
    const r = await audit(state, `${theme.padEnd(5)} ${route}`, [...new Set(brokenLinks)].map((h) => `broken in-page link #${h}`));
    out.push(...r.lines);
    count += r.count;
    if (shots) await page.screenshot({ path: join(shots, `${theme}-${route.replace('/', '-')}.png`), fullPage: true });
  }
  await state.context.close();
  return { out, count };
}

// Interactive states: axe sees what a user sees after acting, not only the initial render.
const scenarios = [
  {
    name: 'dialog open',
    route: 'components/dialog',
    async act(page) {
      await page.getByRole('button', { name: 'Rename vessel' }).first().click();
      await page.getByRole('dialog', { name: 'Rename vessel' }).waitFor();
      return (await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))) ? [] : ['focus did not move into the open dialog'];
    },
  },
  {
    name: 'menu open',
    route: 'components/menu',
    async act(page) {
      await page.getByRole('button', { name: 'Ship actions' }).first().focus();
      await page.keyboard.press('ArrowDown');
      await page.getByRole('menu').first().waitFor();
      return (await page.evaluate(() => document.activeElement?.getAttribute('role') === 'menuitem')) ? [] : ['focus did not move to a menu item'];
    },
  },
  {
    name: 'listbox open',
    route: 'components/combobox',
    async act(page) {
      await page.getByRole('combobox', { name: 'Home planet' }).first().focus();
      await page.keyboard.press('ArrowDown');
      await page.getByRole('listbox').first().waitFor();
      return [];
    },
  },
  {
    name: 'popover open',
    route: 'components/popover',
    async act(page) {
      await page.getByRole('button', { name: /^Popover / }).first().click();
      await page.getByRole('dialog').first().waitFor();
      return [];
    },
  },
  {
    name: 'invalid form submitted',
    route: 'components/form-validation',
    async act(page) {
      await page.getByRole('button', { name: 'Register' }).first().click();
      await page.waitForTimeout(150);
      return page.evaluate(() => {
        const problems = [];
        const invalid = document.querySelectorAll('[aria-invalid="true"]');
        if (!invalid.length) problems.push('no field marked aria-invalid after an invalid submit');
        if (!document.activeElement?.matches('[aria-invalid="true"]')) problems.push('focus did not move to the first invalid field');
        for (const el of invalid) {
          const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
          if (!ids.some((id) => document.getElementById(id)?.textContent?.trim())) problems.push(`${el.id || el.name}: invalid without a described error message`);
        }
        return problems;
      });
    },
  },
  {
    name: 'toast shown',
    route: 'components/toast',
    async act(page) {
      await page.getByRole('button', { name: 'Success (auto-dismiss)' }).first().click();
      await page.getByText('Course plotted').first().waitFor();
      // Announced either by the toast itself being a live region or through the announcer's region.
      await page.waitForTimeout(300);
      const announced = await page.evaluate(() =>
        [...document.querySelectorAll('[role="status"],[role="alert"],[aria-live="polite"],[aria-live="assertive"]')].some((r) => r.textContent.includes('Course plotted')),
      );
      return announced ? [] : ['toast text was not placed in a live region'];
    },
  },
  {
    name: 'command palette open',
    route: 'home',
    async act(page) {
      await page.keyboard.press('Control+k');
      await page.getByRole('combobox').first().waitFor();
      return (await page.evaluate(() => document.activeElement?.getAttribute('role') === 'combobox')) ? [] : ['focus did not move to the palette input'];
    },
  },
].filter((s) => !process.env.ROUTES || process.env.ROUTES.split(',').some((x) => s.route.includes(x)));

async function auditScenarios(theme) {
  const out = [];
  let count = 0;
  for (const s of scenarios) {
    const state = await openPage({}, theme);
    await state.page.goto(`${base}#${s.route}`, { waitUntil: 'networkidle' });
    let extra;
    try {
      extra = await s.act(state.page);
    } catch (e) {
      extra = [`could not reach the state: ${String(e.message).split('\n')[0].slice(0, 160)}`];
    }
    const r = await audit(state, `${theme.padEnd(5)} [${s.name}] ${s.route}`, extra);
    out.push(...r.lines);
    count += r.count;
    await state.context.close();
  }
  return { out, count };
}

// Forced colors (Windows high contrast): keyboard focus must stay visible, which means an outline (box-shadow
// rings disappear). Reflow (WCAG 1.4.10): no page-level horizontal scrolling at 320 CSS px.
const sampleRoutes = ['home', 'getting-started', 'components/button', 'components/dialog', 'components/form-validation', 'components/tabs', 'components/data-table'].filter((r) => routes.includes(r));
async function auditForcedColorsAndReflow() {
  const out = [];
  let count = 0;
  const fc = await openPage({ forcedColors: 'active' }, 'light');
  for (const route of sampleRoutes) {
    await fc.page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
    const problems = [];
    const main = fc.page.locator('main');
    const buttons = main.locator('button:visible');
    if ((await buttons.count()) > 0) {
      await buttons.first().focus();
      await fc.page.keyboard.press('Shift+Tab');
      await fc.page.keyboard.press('Tab');
      const ring = await fc.page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        return { tag: el?.tagName, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
      });
      if (ring.style === 'none' || !(ring.width > 0)) problems.push(`focused ${ring.tag} has no visible outline in forced colors (${ring.style} ${ring.width}px)`);
    }
    if (fc.errors.length) problems.push(...fc.errors.splice(0).map((e) => `console error — ${e}`));
    if (problems.length) {
      count += problems.length;
      for (const p of problems) out.push(`  FAIL forced-colors ${route}: ${p}`);
    } else out.push(`  ok   forced-colors ${route}`);
  }
  await fc.context.close();
  const narrow = await openPage({ viewport: { width: 320, height: 640 } }, 'light');
  for (const route of sampleRoutes) {
    await narrow.page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
    await narrow.page.waitForTimeout(100);
    const overflow = await narrow.page.evaluate(() => {
      const doc = document.scrollingElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    if (overflow > 1) {
      count++;
      out.push(`  FAIL reflow-320 ${route}: page scrolls horizontally by ${overflow}px`);
    } else out.push(`  ok   reflow-320 ${route}`);
  }
  await narrow.context.close();
  return { out, count };
}

const results = await Promise.all([auditTheme('dark'), auditTheme('light')]);
results.push(await auditScenarios('dark'), await auditScenarios('light'), await auditForcedColorsAndReflow());
for (const r of results) {
  console.log(r.out.join('\n'));
  total += r.count;
}
await browser.close();
server.close();
if (total) await writeReport('a11y', reportItems, `${total} violation(s)`);
console.log(
  total
    ? `\n${total} violation(s).`
    : '\nNo axe violations at WCAG A, AA or AAA (pages and interactive states), no console or CSP errors, no broken in-page links, focus visible in forced colors, no horizontal scrolling at 320px.',
);
process.exit(total ? 1 : 0);

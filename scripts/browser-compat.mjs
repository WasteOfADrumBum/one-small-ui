// Cross-engine behaviour checks: the interactions that depend most on the browser (native <dialog> and
// :modal, nested modals, Escape handling, focus containment and return, top-layer popovers, combobox and
// menu keyboard patterns, tooltips on focus). Bundles the `compat` layout fixture from source with Vite.
//
//   npm run test:browsers                       # Chromium
//   npm run test:browsers -- --browser=firefox  # or webkit (npx playwright install --with-deps <browser>)
import { createServer } from 'node:http';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import * as pw from 'playwright';
import { writeReport } from './report-lib.mjs';

const engine = (process.argv.find((a) => a.startsWith('--browser=')) ?? '--browser=chromium').slice(10);
if (!['chromium', 'firefox', 'webkit'].includes(engine)) throw new Error(`unknown browser ${engine}`);

const fixtureRoot = fileURLToPath(new URL('../packages/onesmallui/test/layout/', import.meta.url));
const outDir = await mkdtemp(join(tmpdir(), 'os-compat-'));
await build({ root: fixtureRoot, base: './', logLevel: 'error', plugins: [react()], build: { outDir, emptyOutDir: true } });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(join(outDir, path === '/' ? 'index.html' : path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'text/html' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/?fixture=compat`;

const browser = await pw[engine].launch({
  executablePath: engine === 'chromium' ? process.env.PW_CHROMIUM_PATH || undefined : undefined,
});
const failures = [];
let passed = 0;
const report = [];
let page;
const check = async (ok, message) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (ok) return passed++;
  failures.push(message);
  report.push({ title: message, details: [], screenshot: await page.screenshot({ fullPage: true }).catch(() => undefined) });
};
const errors = [];
const fresh = async () => {
  await page?.context().close();
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });
};
const active = () => page.evaluate(() => {
  const a = document.activeElement;
  return { test: a?.getAttribute('data-test'), dialog: a?.closest('dialog')?.querySelector('h2,h1')?.textContent ?? null, tag: a?.tagName, role: a?.getAttribute('role'), text: a?.textContent?.trim().slice(0, 40) };
});
// Safari only moves focus with Tab to links/buttons when "Press Tab to highlight" is on; Playwright's WebKit
// behaves like the default macOS setting, so Tab sequences are checked where the engine tabs to buttons.
const tabsToButtons = engine !== 'webkit';

console.log(`${engine} ${browser.version()}`);

// ---------- Dialog: modal, focus inside, containment, Escape, focus return, scroll lock ----------
await fresh();
await page.click('[data-test="open-dialog"]');
const modal = await page.evaluate(() => {
  const d = [...document.querySelectorAll('dialog')].find((x) => x.open);
  return { open: !!d, modal: d?.matches(':modal') ?? false, name: d?.getAttribute('aria-labelledby') ? document.getElementById(d.getAttribute('aria-labelledby'))?.textContent : null, locked: document.documentElement.classList.contains('os-scroll-locked') };
});
await check(modal.open && modal.modal, `dialog opens as a modal (:modal ${modal.modal})`);
await check(modal.name === 'Outer dialog', `dialog is named by its title (${modal.name})`);
await check(modal.locked, 'page scroll is locked while the modal is open');
await check((await active()).dialog === 'Outer dialog', `focus moves into the dialog (${JSON.stringify(await active())})`);
if (tabsToButtons) {
  let escaped = false;
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    if ((await active()).dialog !== 'Outer dialog') escaped = true;
  }
  await check(!escaped, 'Tab and Shift+Tab stay inside the dialog');
}
// Nested: Escape closes only the inner dialog and focus returns to its opener.
await page.click('[data-test="open-inner"]');
await check((await active()).dialog === 'Inner dialog', 'nested dialog takes focus');
await page.keyboard.press('Escape');
const afterInner = await page.evaluate(() => [...document.querySelectorAll('dialog')].filter((d) => d.open).length);
await check(afterInner === 1, `Escape closes only the inner dialog (${afterInner} open)`);
await check((await active()).test === 'open-inner', `focus returns to the inner dialog's opener (${JSON.stringify(await active())})`);
await page.keyboard.press('Escape');
const closed = await page.evaluate(() => ({ open: [...document.querySelectorAll('dialog')].filter((d) => d.open).length, locked: document.documentElement.classList.contains('os-scroll-locked') }));
await check(closed.open === 0, 'second Escape closes the outer dialog');
await check(!closed.locked, 'scroll lock is released after the last modal closes');
await check((await active()).test === 'open-dialog', `focus returns to the page trigger (${JSON.stringify(await active())})`);

// ---------- Popover: top layer, named dialog, Escape, aria-expanded ----------
await fresh();
await page.click('[data-test="popover-trigger"]');
const pop = await page.evaluate(() => {
  const t = document.querySelector('[data-test="popover-trigger"]');
  const panel = document.querySelector('[role="dialog"]');
  const box = panel?.getBoundingClientRect();
  let topLayer = null;
  try {
    topLayer = panel?.matches(':popover-open') ?? null;
  } catch {
    topLayer = 'unsupported';
  }
  return { expanded: t.getAttribute('aria-expanded'), visible: !!box && box.width > 0 && box.height > 0, topLayer, hit: box ? document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('[role="dialog"]') === panel : false };
});
await check(pop.expanded === 'true' && pop.visible, `popover opens and the trigger reports aria-expanded (${JSON.stringify(pop)})`);
await check(pop.hit, 'popover panel is on top (hit test lands on it)');
await page.keyboard.press('Escape');
const popClosed = await page.evaluate(() => ({ panel: !!document.querySelector('[role="dialog"]'), expanded: document.querySelector('[data-test="popover-trigger"]').getAttribute('aria-expanded'), focus: document.activeElement?.getAttribute('data-test') }));
await check(!popClosed.panel && popClosed.expanded === 'false', `Escape closes the popover (${JSON.stringify(popClosed)})`);
await check(popClosed.focus === 'popover-trigger', 'focus stays on or returns to the popover trigger');

// ---------- Combobox: APG keyboard pattern ----------
await fresh();
const input = page.getByRole('combobox', { name: 'Planet' });
await input.focus();
await page.keyboard.press('ArrowDown');
const cb = await page.evaluate(() => {
  const i = document.querySelector('[role="combobox"]');
  const ad = i.getAttribute('aria-activedescendant');
  const list = document.getElementById(i.getAttribute('aria-controls'));
  return { expanded: i.getAttribute('aria-expanded'), active: ad ? document.getElementById(ad)?.textContent : null, options: list?.querySelectorAll('[role="option"]').length ?? 0 };
});
await check(cb.expanded === 'true' && cb.options === 5 && cb.active === 'Mercury', `ArrowDown opens the listbox on the first option (${JSON.stringify(cb)})`);
await page.keyboard.type('ma');
await page.keyboard.press('ArrowDown');
const filtered = await page.evaluate(() => {
  const i = document.querySelector('[role="combobox"]');
  const ad = i.getAttribute('aria-activedescendant');
  return { options: [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent), active: ad ? document.getElementById(ad)?.textContent : null };
});
await check(filtered.options.join() === 'Mars' && filtered.active === 'Mars', `typing filters the options (${JSON.stringify(filtered)})`);
await page.keyboard.press('Enter');
await check((await input.inputValue()) === 'Mars' && (await input.getAttribute('aria-expanded')) === 'false', 'Enter selects and closes');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Escape');
await check((await input.getAttribute('aria-expanded')) === 'false', 'Escape closes the listbox');
await check(await input.evaluate((el) => el === document.activeElement), 'focus stays in the combobox');

// ---------- Menu: menu button pattern ----------
await fresh();
await page.focus('[data-test="menu-trigger"]');
await page.keyboard.press('ArrowDown');
const first = await active();
await check(first.role === 'menuitem' && first.text === 'Edit', `ArrowDown opens the menu on the first item (${JSON.stringify(first)})`);
await page.keyboard.press('ArrowDown');
const second = await active();
await check(second.text === 'Share', `ArrowDown skips the disabled item (${second.text})`);
await page.keyboard.press('Escape');
const back = await active();
await check(back.test === 'menu-trigger' && (await page.$('[role="menu"]')) === null, 'Escape closes the menu and returns focus to the trigger');

// ---------- Tooltip: shows on keyboard focus, dismissible with Escape (WCAG 1.4.13) ----------
await fresh();
await page.focus('[data-test="tooltip-trigger"]');
await page.waitForTimeout(400);
const tip = await page.evaluate(() => {
  const t = document.querySelector('[role="tooltip"]');
  const b = t?.getBoundingClientRect();
  return { shown: !!b && b.width > 0 && getComputedStyle(t).visibility !== 'hidden', described: document.querySelector('[data-test="tooltip-trigger"]').getAttribute('aria-describedby') === t?.id };
});
await check(tip.shown && tip.described, `tooltip shows on focus and describes its trigger (${JSON.stringify(tip)})`);
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const tipHidden = await page.evaluate(() => {
  const t = document.querySelector('[role="tooltip"]');
  if (!t) return true;
  const b = t.getBoundingClientRect();
  return b.width === 0 || getComputedStyle(t).visibility === 'hidden' || t.closest('[data-state="closed"],[hidden]') !== null;
});
await check(tipHidden, 'Escape dismisses the tooltip without moving focus');

await check(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
await browser.close();
server.close();
console.log(`\n${engine}: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  await writeReport(`browsers-${engine}`, report, `${failures.length} failure(s) in ${engine}`);
  process.exit(1);
}

// Layout checks that need a real browser (jsdom has no layout). Bundles the fixtures in
// packages/onesmallui/test/layout with Vite, serves them, and measures them in Chromium.
//   npm run test:layout
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { chromium } from 'playwright';
import { writeReport } from './report-lib.mjs';

const fixtureRoot = fileURLToPath(new URL('../packages/onesmallui/test/layout/', import.meta.url));
const outDir = await mkdtemp(join(tmpdir(), 'os-layout-'));
await build({ root: fixtureRoot, base: './', logLevel: 'error', plugins: [react()], build: { outDir, emptyOutDir: true } });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(outDir, path === '/' ? 'index.html' : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({
  executablePath: existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
    : undefined,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const failures = [];
const shots = new Map();
let passed = 0;
let current = '';
const check = (ok, message) => {
  if (ok) passed++;
  else {
    failures.push(message);
    // One screenshot per failing fixture, taken while the page still shows it.
    if (!shots.has(current)) shots.set(current, page.screenshot({ fullPage: true }));
  }
};
const open = async (fixture) => {
  current = fixture;
  await page.goto(`${base}?fixture=${fixture}`, { waitUntil: 'networkidle' });
  // Let images decode and React swap broken ones for initials.
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  await page.waitForTimeout(50);
};

// ---------- Avatar: every size and shape is an exact square, image or not ----------
await open('avatar');
const avatars = await page.$$eval('[data-test]', (els) =>
  els
    .filter((el) => el.classList.contains('os-avatar'))
    .map((el) => {
      const box = el.getBoundingClientRect();
      const frame = el.querySelector('.os-avatar__frame')?.getBoundingClientRect();
      const img = el.querySelector('img')?.getBoundingClientRect();
      const dot = el.querySelector('.os-avatar__status');
      const dotBox = dot?.getBoundingClientRect();
      // The dot must not be inside an overflow-clipping ancestor within the avatar.
      let clipped = false;
      for (let p = dot?.parentElement; p && p !== el.parentElement; p = p.parentElement) {
        if (p !== el && getComputedStyle(p).overflow !== 'visible') clipped = true;
      }
      return {
        name: el.dataset.test,
        w: box.width,
        h: box.height,
        frame: frame && [frame.width, frame.height],
        img: img && [img.width, img.height],
        initials: !!el.querySelector('.os-avatar__initials'),
        dot: dotBox && dotBox.width > 0 && dotBox.height > 0,
        clipped,
      };
    }),
);
check(avatars.length === 2 * 6 * 4 * 2, `expected 96 avatars, found ${avatars.length}`);
for (const a of avatars) {
  check(a.w > 0 && Math.abs(a.w - a.h) < 0.5, `${a.name}: avatar is ${a.w}×${a.h}, not square`);
  check(a.frame && Math.abs(a.frame[0] - a.w) < 0.5 && Math.abs(a.frame[1] - a.h) < 0.5, `${a.name}: frame ${a.frame} ≠ avatar`);
  if (a.name.endsWith('broken')) check(a.initials && !a.img, `${a.name}: broken image did not fall back to initials`);
  else check(a.img && Math.abs(a.img[0] - a.w) < 0.5 && Math.abs(a.img[1] - a.h) < 0.5, `${a.name}: image ${a.img} ≠ avatar ${a.w}×${a.h}`);
  if (a.name.startsWith('single')) check(a.dot && !a.clipped, `${a.name}: status dot is clipped or missing`);
}

// ---------- DataTable: sticky header stays put while the region scrolls both ways ----------
await open('data-table');
const table = await page.evaluate(async () => {
  const table = document.querySelector('table');
  let region = table.parentElement;
  while (region && !['auto', 'scroll'].includes(getComputedStyle(region).overflowY)) region = region.parentElement;
  const th = table.querySelector('thead th');
  region.scrollTop = 300;
  region.scrollLeft = 200;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  // Pinned: the header's top edge sits on the region's top edge (the caption has scrolled away).
  const pinned = th.getBoundingClientRect().top - region.getBoundingClientRect().top - region.clientTop;
  // The cell painted where the header sits must be the header, not a body row showing through.
  const box = th.getBoundingClientRect();
  const r = region.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, box.top + box.height / 2);
  return {
    found: !!region,
    focusable: region?.tabIndex === 0,
    scrolledY: region.scrollTop > 0,
    scrolledX: region.scrollLeft > 0,
    pinned,
    widths: [region.scrollWidth, region.clientWidth],
    onTop: !!hit && !!hit.closest('thead'),
    bg: getComputedStyle(th).backgroundColor,
  };
});
check(table.found && table.focusable, 'data-table: no keyboard-focusable scroll region');
check(table.scrolledY && table.scrolledX, `data-table: region does not scroll on both axes (scroll/client width ${table.widths})`);
check(Math.abs(table.pinned) < 1, `data-table: header is ${table.pinned}px from the top of the scrolled region, not pinned`);
check(table.onTop, 'data-table: body content paints over the sticky header');
check(!/rgba\(.*, 0\)|transparent/.test(table.bg), `data-table: sticky header background is transparent (${table.bg})`);

// ---------- Sidebar: expanded width, rail width, drawer below lg, RTL mirror ----------
const sidebarAt = async (query, width) => {
  current = `sidebar ${query || 'expanded'} @${width}`;
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}?fixture=sidebar${query ? `&${query}` : ''}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(50);
};
const measureSidebar = () =>
  page.evaluate(() => {
    const nav = document.querySelector('nav.os-sidebar');
    const box = nav?.getBoundingClientRect();
    const link = document.querySelector('[data-test="first-item"]');
    const label = link?.querySelector('.os-sidebar__label')?.getBoundingClientRect();
    return {
      mode: nav?.dataset.mode,
      visible: !!nav && nav.checkVisibility(),
      left: box?.left,
      right: box?.right,
      width: box?.width,
      vw: document.documentElement.clientWidth,
      rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
      linkHeight: link?.getBoundingClientRect().height,
      labelWidth: label?.width,
    };
  });
const tooltipBox = async () => {
  await page.focus('[data-test="first-item"]');
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const link = document.querySelector('[data-test="first-item"]');
    const tip = link.closest('.os-sidebar__tip').querySelector('.os-tooltip__content');
    const l = link.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    return { open: tip.dataset.state === 'open' && t.width > 0, linkLeft: l.left, linkRight: l.right, tipLeft: t.left, tipRight: t.right };
  });
};
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;

for (const dir of ['ltr', 'rtl']) {
  const q = dir === 'rtl' ? 'dir=rtl' : '';
  // Expanded at 1280px: 16rem wide, against the inline-start edge.
  await sidebarAt(q, 1280);
  let s = await measureSidebar();
  check(s.mode === 'expanded' && s.visible, `sidebar ${dir}: expected a visible expanded sidebar, got ${s.mode}`);
  check(near(s.width, 16 * s.rem), `sidebar ${dir}: expanded width ${s.width}px, expected ${16 * s.rem}px`);
  if (dir === 'ltr') check(near(s.left, 0), `sidebar ltr: left edge at ${s.left}px, expected 0`);
  else check(near(s.right, s.vw), `sidebar rtl: right edge at ${s.right}px, expected ${s.vw}px (mirrored)`);
  check(s.linkHeight >= 44, `sidebar ${dir}: item is ${s.linkHeight}px tall, below the 44px target`);

  // The toggle collapses it to the rail (after the width transition).
  await page.click('[data-test="inner-toggle"]');
  await page.waitForTimeout(500);
  s = await measureSidebar();
  check(s.mode === 'collapsed' && near(s.width, 4.5 * s.rem), `sidebar ${dir}: rail width ${s.width}px after toggling, expected ${4.5 * s.rem}px`);

  // Starting as a rail: 4.5rem, labels hidden, tooltip on the inline-end side.
  await sidebarAt(q ? `${q}&collapsed=1` : 'collapsed=1', 1280);
  s = await measureSidebar();
  check(s.mode === 'collapsed' && near(s.width, 4.5 * s.rem), `sidebar ${dir}: rail width ${s.width}px, expected ${4.5 * s.rem}px`);
  check(s.labelWidth <= 1, `sidebar ${dir}: rail label is ${s.labelWidth}px wide, expected visually hidden`);
  if (dir === 'rtl') check(near(s.right, s.vw), `sidebar rtl: rail right edge at ${s.right}px, expected ${s.vw}px`);
  const tip = await tooltipBox();
  check(tip.open, `sidebar ${dir}: rail tooltip did not open on focus`);
  if (dir === 'ltr') check(tip.tipLeft >= tip.linkRight, `sidebar ltr: tooltip (left ${tip.tipLeft}) is not right of the item (right ${tip.linkRight})`);
  else check(tip.tipRight <= tip.linkLeft, `sidebar rtl: tooltip (right ${tip.tipRight}) is not left of the item (left ${tip.linkLeft})`);

  // Below lg (800px): no inline sidebar; the outside toggle opens a drawer from the inline-start edge.
  await sidebarAt(q, 800);
  s = await measureSidebar();
  check(!s.visible, `sidebar ${dir}: sidebar is visible at 800px before the drawer opens`);
  check(s.mode === 'drawer', `sidebar ${dir}: expected drawer mode at 800px, got ${s.mode}`);
  await page.click('[data-test="outer-toggle"]');
  await page.waitForTimeout(500);
  const drawer = await page.evaluate(() => {
    const dialog = document.querySelector('dialog.os-sidebar-drawer');
    const panel = dialog?.querySelector('.os-drawer__panel')?.getBoundingClientRect();
    const nav = dialog?.querySelector('nav.os-sidebar');
    return { open: !!dialog?.open, left: panel?.left, right: panel?.right, navVisible: !!nav?.checkVisibility(), vw: document.documentElement.clientWidth };
  });
  check(drawer.open && drawer.navVisible, `sidebar ${dir}: drawer did not open with the nav inside`);
  if (dir === 'ltr') check(near(drawer.left, 0), `sidebar ltr: drawer panel left edge at ${drawer.left}px, expected 0`);
  else check(near(drawer.right, drawer.vw), `sidebar rtl: drawer panel right edge at ${drawer.right}px, expected ${drawer.vw}px`);
}
await page.setViewportSize({ width: 1280, height: 900 });

if (failures.length) {
  const items = [{ title: 'Failed checks', details: failures }];
  for (const [fixture, shot] of shots) items.push({ title: `Fixture: ${fixture}`, screenshot: await shot });
  await writeReport('layout', items, `${failures.length} failed, ${passed} passed`);
}
await browser.close();
server.close();
await rm(outDir, { recursive: true, force: true });
for (const f of failures) console.log(`  FAIL ${f}`);
console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);

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

// ---------- ContextMenu: opened at every corner and edge, it stays inside the viewport ----------
const menuBox = () =>
  page.evaluate(async () => {
    const el = document.querySelector('[data-test="context-menu"]');
    if (!el || !el.hasAttribute('data-side')) return null;
    await Promise.all(el.getAnimations().map((a) => a.finished));
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      scrolls: el.scrollHeight > el.clientHeight,
      focus: document.activeElement?.getAttribute('role'),
    };
  });
const waitForMenu = () => page.waitForSelector('[data-test="context-menu"][data-side]', { timeout: 2000 }).catch(() => null);

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 375, height: 667 },
  { width: 640, height: 320 },
]) {
  await page.setViewportSize(viewport);
  await open('context-menu');
  const { width: w, height: h } = viewport;
  const points = {
    'top-left': [2, 2],
    top: [w / 2, 2],
    'top-right': [w - 2, 2],
    right: [w - 2, h / 2],
    'bottom-right': [w - 2, h - 2],
    bottom: [w / 2, h - 2],
    'bottom-left': [2, h - 2],
    left: [2, h / 2],
    center: [w / 2, h / 2],
  };
  for (const [name, [x, y]] of Object.entries(points)) {
    const label = `context-menu ${w}×${h} ${name}`;
    await page.mouse.click(x, y, { button: 'right' });
    await waitForMenu();
    const box = await menuBox();
    check(!!box, `${label}: menu did not open on right-click`);
    if (box) {
      const inside = box.left >= 0 && box.top >= 0 && box.right <= w && box.bottom <= h;
      check(inside, `${label}: menu ${JSON.stringify(box)} leaves the ${w}×${h} viewport`);
      check(box.focus === 'menuitem', `${label}: focus is on ${box.focus}, not the first item`);
      // At the pointer: its top or bottom edge on the pointer, and the pointer within its width
      // (narrow viewports shift the menu sideways to fit).
      if (name === 'center') {
        const nearY = Math.min(Math.abs(box.top - y), Math.abs(box.bottom - y)) < 4;
        const spansX = box.left - 4 <= x && x <= box.right + 4;
        check(nearY && spansX, `${label}: menu ${JSON.stringify(box)} is not at the pointer (${x}, ${y})`);
      }
    }
    await page.keyboard.press('Escape');
    const back = await page.evaluate(() => ({
      open: !!document.querySelector('[data-test="context-menu"]'),
      focus: document.activeElement?.getAttribute('data-test'),
    }));
    check(!back.open && back.focus === 'context-target', `${label}: Escape left ${JSON.stringify(back)}`);
  }

  // Keyboard: Shift+F10 on the focused full-viewport target anchors inside it, not below the viewport.
  await page.focus('[data-test="context-target"]');
  await page.keyboard.press('Shift+F10');
  await waitForMenu();
  const kb = await menuBox();
  check(!!kb, `context-menu ${w}×${h} Shift+F10: menu did not open`);
  if (kb) check(kb.left >= 0 && kb.top >= 0 && kb.right <= w && kb.bottom <= h, `context-menu ${w}×${h} Shift+F10: menu ${JSON.stringify(kb)} leaves the viewport`);
  await page.keyboard.press('Escape');
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

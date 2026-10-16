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
// The page a failure screenshot comes from, when a section uses its own context.
let shotPage = null;
const check = (ok, message) => {
  if (ok) passed++;
  else {
    failures.push(message);
    // One screenshot per failing fixture, taken while the page still shows it.
    if (!shots.has(current)) shots.set(current, (shotPage ?? page).screenshot({ fullPage: true }));
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

// ---------- CommandPalette: fits the viewport on phones, tablets and desktop ----------
await page.emulateMedia({ reducedMotion: 'reduce' });
for (const [width, height] of [
  [360, 740],
  [768, 1024],
  [1280, 900],
]) {
  await page.setViewportSize({ width, height });
  await open('command-palette');
  await page.waitForTimeout(300);
  const tag = `command-palette @${width}px`;
  const m = await page.evaluate(() => {
    const dialog = document.querySelector('dialog.os-command-palette');
    const panel = dialog?.querySelector('.os-dialog__panel');
    const results = dialog?.querySelector('[role="listbox"]');
    const input = dialog?.querySelector('input[role="combobox"]');
    if (!dialog?.open || !panel || !results || !input) return null;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const options = Array.from(dialog.querySelectorAll('[role="option"]')).map(box);
    return {
      vw: document.documentElement.clientWidth,
      vh: window.innerHeight,
      pageScrollWidth: document.documentElement.scrollWidth,
      panel: box(panel),
      panelOverflowX: panel.scrollWidth - panel.clientWidth,
      results: box(results),
      resultsScrolls: results.scrollHeight > results.clientHeight,
      input: box(input),
      focused: document.activeElement === input,
      options,
    };
  });
  check(!!m, `${tag}: palette did not open`);
  if (!m) continue;
  const { panel, vw, vh } = m;
  check(panel.left >= -0.5 && panel.top >= -0.5 && panel.right <= vw + 0.5 && panel.bottom <= vh + 0.5, `${tag}: panel ${JSON.stringify(panel)} leaves the ${vw}×${vh} viewport`);
  check(m.pageScrollWidth <= vw, `${tag}: page scrolls sideways (${m.pageScrollWidth} > ${vw})`);
  check(m.panelOverflowX <= 0, `${tag}: panel content overflows sideways by ${m.panelOverflowX}px`);
  check(m.results.bottom <= panel.bottom + 0.5 && m.resultsScrolls, `${tag}: results don't scroll inside the panel`);
  check(m.input.width >= 150 && m.input.right <= panel.right, `${tag}: search input is ${m.input.width}px wide or clipped`);
  check(m.focused, `${tag}: focus is not on the search input`);
  check(m.options.length === 30 && m.options.every((o) => o.height >= 44 && o.right <= panel.right + 0.5), `${tag}: options are under 44px tall or overflow the panel`);
  if (width < 576) check(Math.abs(panel.width - vw) < 1 && Math.abs(panel.height - vh) < 1, `${tag}: not full screen below sm (${panel.width}×${panel.height})`);
  else check(panel.width <= 640.5 && panel.top > 0, `${tag}: panel should be a centered 40rem card (${panel.width}px wide, top ${panel.top})`);
}

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

// ---------- Popconfirm: opened at every corner and edge, it stays inside the viewport ----------
const popconfirmSpots = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'center'];
const popconfirmBox = (name) =>
  page.evaluate(async (name) => {
    const el = document.querySelector(`.layout-popconfirm-${name}`);
    if (!el || !el.hasAttribute('data-side')) return null;
    await Promise.all(el.getAnimations().map((a) => a.finished));
    const box = (r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    const t = document.querySelector(`[data-test="popconfirm-${name}"]`).getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      ...box(r),
      trigger: box(t),
      // The panel must sit beside the trigger, not on top of it.
      overlaps: r.left < t.right && t.left < r.right && r.top < t.bottom && t.top < r.bottom,
      overflowX: el.scrollWidth - el.clientWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
      role: el.getAttribute('role'),
      focus: document.activeElement?.textContent,
      buttons: Array.from(el.querySelectorAll('button')).map((b) => b.getBoundingClientRect().height),
    };
  }, name);
const popconfirmClosed = (name) =>
  page
    .waitForFunction((name) => !document.querySelector(`.layout-popconfirm-${name}`), name, { timeout: 2000 })
    .then(() => true)
    .catch(() => false);
const focusedTest = () => page.evaluate(() => document.activeElement?.getAttribute('data-test'));

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 360, height: 740 },
  { width: 360, height: 640 },
]) {
  await page.setViewportSize(viewport);
  await open('popconfirm');
  const { width: w, height: h } = viewport;
  for (const name of popconfirmSpots) {
    const label = `popconfirm ${w}×${h} ${name}`;
    await page.click(`[data-test="popconfirm-${name}"]`);
    await page.waitForSelector(`.layout-popconfirm-${name}[data-side]`, { timeout: 2000 }).catch(() => null);
    const box = await popconfirmBox(name);
    check(!!box, `${label}: popconfirm did not open`);
    if (box) {
      const { trigger, overlaps, overflowX, pageScrollWidth, role, focus, buttons, ...panel } = box;
      check(panel.left >= 0 && panel.top >= 0 && panel.right <= w && panel.bottom <= h, `${label}: panel ${JSON.stringify(panel)} leaves the ${w}×${h} viewport`);
      check(!overlaps, `${label}: panel ${JSON.stringify(panel)} covers its trigger ${JSON.stringify(trigger)}`);
      check(overflowX <= 0, `${label}: panel content overflows sideways by ${overflowX}px`);
      check(pageScrollWidth <= w, `${label}: page scrolls sideways (${pageScrollWidth} > ${w})`);
      check(role === 'alertdialog' && focus === 'Cancel', `${label}: role ${role}, focus on "${focus}" (expected alertdialog, Cancel)`);
      check(buttons.length === 2 && buttons.every((b) => b >= 32), `${label}: buttons are ${buttons} px tall`);
    }
    await page.keyboard.press('Escape');
    check(await popconfirmClosed(name), `${label}: Escape did not close it`);
    check((await focusedTest()) === `popconfirm-${name}`, `${label}: Escape left focus on ${await focusedTest()}, not the trigger`);
  }
}

// Outside clicks, with a real browser moving focus: plain text returns focus to the trigger,
// another control keeps it.
await page.setViewportSize({ width: 1280, height: 900 });
await open('popconfirm');
await page.click('[data-test="popconfirm-center"]');
await page.waitForSelector('.layout-popconfirm-center[data-side]');
await page.click('[data-test="popconfirm-outside"]');
check(await popconfirmClosed('center'), 'popconfirm: an outside click did not close it');
check((await focusedTest()) === 'popconfirm-center', `popconfirm: an outside click on text left focus on ${await focusedTest()}, not the trigger`);
await page.click('[data-test="popconfirm-center"]');
await page.waitForSelector('.layout-popconfirm-center[data-side]');
await page.click('[data-test="popconfirm-other"]');
check(await popconfirmClosed('center'), 'popconfirm: a click on another control did not close it');
await page.waitForTimeout(50);
check((await focusedTest()) === 'popconfirm-other', `popconfirm: a click on another control moved focus to ${await focusedTest()}`);

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

// ---------- Rating: half fill and half hit area at the inline start, in LTR and RTL ----------
await open('rating');
for (const dir of ['ltr', 'rtl']) {
  const r = await page.evaluate((dir) => {
    const box = (el) => {
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height };
    };
    const measure = (root) => {
      const items = Array.from(root.querySelectorAll('.os-rating__item'));
      return items.map((item) => {
        const glyph = item.querySelector('.os-rating__glyph');
        const [outline, filled] = glyph.querySelectorAll('svg');
        const fill = glyph.querySelector('.os-rating__fill');
        return {
          state: glyph.dataset.fill,
          item: box(item),
          glyph: box(glyph),
          outline: box(outline),
          filled: box(filled),
          fill: box(fill),
          inputs: Array.from(item.querySelectorAll('input')).map((i) => ({ value: i.value, ...box(i) })),
        };
      });
    };
    const half = document.querySelector(`[data-test="rating-${dir}"]`);
    const whole = document.querySelector(`[data-test="rating-whole-${dir}"]`);
    const ro = document.querySelector(`[data-test="rating-readonly-${dir}"]`);
    const third = half.querySelectorAll('.os-rating__item')[2].getBoundingClientRect();
    const y = third.top + third.height / 2;
    const startX = dir === 'rtl' ? third.right - third.width / 4 : third.left + third.width / 4;
    const endX = dir === 'rtl' ? third.left + third.width / 4 : third.right - third.width / 4;
    return {
      half: measure(half),
      whole: measure(whole),
      readonly: measure(ro),
      hitStart: document.elementFromPoint(startX, y)?.value,
      hitEnd: document.elementFromPoint(endX, y)?.value,
      hoverPoint: [startX + (dir === 'rtl' ? -1 : 1) * third.width, y],
    };
  }, dir);
  const tag = `rating ${dir}`;
  const isStartHalf = (inner, outer) =>
    dir === 'ltr'
      ? near(inner.left, outer.left) && near(inner.right, outer.left + outer.width / 2)
      : near(inner.right, outer.right) && near(inner.left, outer.right - outer.width / 2);
  const third = r.half[2];
  check(third.state === 'half', `${tag}: third star is ${third.state}, expected half`);
  check(isStartHalf(third.fill, third.glyph), `${tag}: half fill ${JSON.stringify(third.fill)} is not the inline-start half of ${JSON.stringify(third.glyph)}`);
  for (const [i, s] of r.half.entries()) {
    check(near(s.filled.left, s.outline.left, 0.5) && near(s.filled.top, s.outline.top, 0.5) && near(s.filled.width, s.outline.width, 0.5), `${tag}: star ${i + 1} filled copy is offset from its outline`);
    check(s.item.width >= 48 - 0.5 && s.item.height >= 44 - 0.5, `${tag}: half-step item ${i + 1} is ${s.item.width}×${s.item.height}, below 48×44`);
    const [h, f] = s.inputs;
    check(h && f && isStartHalf(h, s.item), `${tag}: star ${i + 1} half-step radio is not on the inline-start half`);
    check(h && h.width >= 24 - 0.5 && h.height >= 44 - 0.5, `${tag}: star ${i + 1} half-step target is ${h?.width}×${h?.height}, below 24×44`);
  }
  check(r.half[0].state === 'full' && r.half[1].state === 'full' && r.half[3].state === 'empty', `${tag}: fills ${r.half.map((s) => s.state)}`);
  check(r.hitStart === '2.5' && r.hitEnd === '3', `${tag}: inline-start/end of star 3 hit ${r.hitStart}/${r.hitEnd}, expected 2.5/3`);
  // Stars follow the reading order: star 1 at the inline start.
  check(dir === 'ltr' ? r.half[0].item.left < r.half[4].item.left : r.half[0].item.left > r.half[4].item.left, `${tag}: stars are not in reading order`);
  check(r.whole.every((s) => s.item.width >= 44 - 0.5 && s.item.height >= 44 - 0.5 && s.inputs.length === 1), `${tag}: whole-step targets under 44×44`);
  check(r.whole.map((s) => s.state).join() === 'full,full,full,empty,empty', `${tag}: whole-step fills ${r.whole.map((s) => s.state)}`);
  const ro = r.readonly[2];
  check(ro.state === 'half' && isStartHalf(ro.fill, ro.glyph) && ro.inputs.length === 0, `${tag}: read-only half star is wrong (${ro.state}, ${JSON.stringify(ro.fill)})`);

  // Hover over the inline-start half of star 4 previews 3.5 and leaves the value alone.
  await page.mouse.move(...r.hoverPoint);
  const hover = await page.evaluate((dir) => {
    const root = document.querySelector(`[data-test="rating-${dir}"]`);
    return {
      fills: Array.from(root.querySelectorAll('.os-rating__glyph')).map((g) => g.dataset.fill).join(),
      preview: root.hasAttribute('data-preview'),
      checked: root.querySelector('input:checked')?.value,
    };
  }, dir);
  check(hover.fills === 'full,full,full,half,empty' && hover.preview && hover.checked === '2.5', `${tag}: hover preview ${JSON.stringify(hover)}`);
  await page.mouse.move(1, 1);
  const left = await page.evaluate((dir) => document.querySelector(`[data-test="rating-${dir}"]`).hasAttribute('data-preview'), dir);
  check(!left, `${tag}: preview stays after the pointer leaves`);
}

// ---------- Timeline: horizontal scrolls inside itself at 360px; alternating mirrors in RTL ----------
const timelineAt = async (query, width) => {
  current = `timeline ${query} @${width}`;
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${base}?fixture=timeline&${query}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(50);
};

await timelineAt('layout=horizontal', 360);
const horizontal = await page.evaluate(async () => {
  const viewport = document.querySelector('[data-test="timeline"] .os-timeline__viewport');
  const items = Array.from(viewport.querySelectorAll('li')).map((li) => li.getBoundingClientRect());
  const scrollable = viewport.scrollWidth > viewport.clientWidth;
  viewport.scrollLeft = 200;
  await new Promise((r) => requestAnimationFrame(r));
  return {
    vw: document.documentElement.clientWidth,
    pageScrollWidth: document.documentElement.scrollWidth,
    viewportRight: viewport.getBoundingClientRect().right,
    scrollable,
    scrolled: viewport.scrollLeft > 0,
    region: viewport.getAttribute('role') === 'region' && viewport.tabIndex === 0 && viewport.getAttribute('aria-label') === 'Mission',
    sameRow: items.every((r) => Math.abs(r.top - items[0].top) < 1),
    minWidth: Math.min(...items.map((r) => r.width)),
  };
});
check(horizontal.pageScrollWidth <= horizontal.vw, `timeline horizontal @360: page scrolls sideways (${horizontal.pageScrollWidth} > ${horizontal.vw})`);
check(horizontal.viewportRight <= horizontal.vw, `timeline horizontal @360: scroll region ends at ${horizontal.viewportRight}px, past the viewport`);
check(horizontal.scrollable && horizontal.scrolled, 'timeline horizontal @360: the timeline does not scroll inside its region');
check(horizontal.region, 'timeline horizontal @360: the overflowing timeline is not a focusable region named "Mission"');
check(horizontal.sameRow && horizontal.minWidth >= 150, `timeline horizontal @360: items are not one row of readable width (${horizontal.minWidth}px)`);

const timelineSides = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-test="timeline"] li')).map((li) => {
      const m = li.querySelector('.os-timeline__marker').getBoundingClientRect();
      const b = li.querySelector('.os-timeline__body').getBoundingClientRect();
      const list = li.parentElement.getBoundingClientRect();
      return {
        side: b.right <= m.left ? 'left' : b.left >= m.right ? 'right' : 'overlap',
        centered: Math.abs(m.left + m.width / 2 - (list.left + list.width / 2)) < 2,
        page: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      };
    }),
  );
for (const dir of ['ltr', 'rtl']) {
  // Wide: odd items on the inline-start side of a centered line (left in LTR, right in RTL).
  await timelineAt(`layout=alternating&dir=${dir}`, 1280);
  const start = dir === 'ltr' ? 'left' : 'right';
  const end = dir === 'ltr' ? 'right' : 'left';
  const wide = await timelineSides();
  check(wide.length === 6, `timeline alternating ${dir}: expected 6 items, found ${wide.length}`);
  wide.forEach((it, i) => {
    const want = i % 2 === 0 ? start : end;
    check(it.side === want, `timeline alternating ${dir} @1280: item ${i + 1} is on the ${it.side}, expected ${want}`);
    check(it.centered, `timeline alternating ${dir} @1280: item ${i + 1}'s marker is not on the centered line`);
  });
  // Narrow: one side, content after the marker (inline end), and no page overflow.
  await timelineAt(`layout=alternating&dir=${dir}`, 360);
  const narrow = await timelineSides();
  narrow.forEach((it, i) => {
    check(it.side === end, `timeline alternating ${dir} @360: item ${i + 1} is on the ${it.side}, expected ${end} (single column)`);
    check(it.page, `timeline alternating ${dir} @360: page scrolls sideways`);
  });
}
await page.setViewportSize({ width: 1280, height: 900 });

// ---------- Lightbox: fits phones and desktop; swipe, pinch, double tap, keyboard zoom and pan ----------
// Its own touch context (Chromium touch emulation); gestures go through CDP Input.dispatchTouchEvent.
const measureLightbox = (tp) =>
  tp.evaluate(async () => {
    // Let React commit and the (reduced-motion, 0.01ms) transform transition settle: wait until
    // the image's transform reads the same for three frames in a row (a busy machine can lag).
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const read = () => {
      const el = document.querySelector('dialog.os-lightbox .os-lightbox__image');
      return `${el ? getComputedStyle(el).transform : ''}|${document.querySelector('.os-lightbox__counter')?.textContent}`;
    };
    await new Promise((r) => setTimeout(r, 30));
    for (let last = read(), same = 0, i = 0; same < 3 && i < 60; i++) {
      await frame();
      const now = read();
      same = now === last ? same + 1 : 0;
      last = now;
    }
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const dialog = document.querySelector('dialog.os-lightbox');
    const stage = dialog?.querySelector('.os-lightbox__stage');
    const img = dialog?.querySelector('.os-lightbox__image');
    const controls = dialog?.querySelectorAll('.os-lightbox__toolbar :is(button, a), .os-lightbox__nav, .os-lightbox__thumb') ?? [];
    return {
      open: !!dialog?.open,
      vw: document.documentElement.clientWidth,
      vh: window.innerHeight,
      pageScrollWidth: document.documentElement.scrollWidth,
      panel: box(dialog?.querySelector('.os-dialog__panel')),
      stage: box(stage),
      img: box(img),
      transform: img ? getComputedStyle(img).transform : null,
      counter: dialog?.querySelector('.os-lightbox__counter')?.textContent,
      status: stage?.getAttribute('data-status'),
      zoomed: !!dialog?.querySelector('[data-zoomed]'),
      controls: Array.from(controls).map((el) => ({ name: el.getAttribute('aria-label'), thumb: el.classList.contains('os-lightbox__thumb'), ...box(el) })),
      thumbs: box(dialog?.querySelector('.os-lightbox__thumbnails')),
      caption: box(dialog?.querySelector('.os-lightbox__caption')),
      error: box(dialog?.querySelector('.os-lightbox__error')),
    };
  });
// Scale and translation of a computed `matrix(a, b, c, d, tx, ty)` (identity for none).
const scaleOf = (t) => (t && t !== 'none' ? Math.hypot(...t.slice(7, -1).split(', ').slice(0, 2).map(Number)) : 1);
const translateOf = (t) => (t && t !== 'none' ? t.slice(7, -1).split(', ').slice(4).map(Number) : [0, 0]);
const within = (a, b, tol = 0.5) => !!a && a.left >= b.left - tol && a.top >= b.top - tol && a.right <= b.right + tol && a.bottom <= b.bottom + tol;

for (const [width, height] of [
  [360, 740],
  [1280, 900],
]) {
  for (const dir of ['ltr', 'rtl']) {
    const tag = `lightbox ${dir} @${width}px`;
    current = tag;
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 576, reducedMotion: 'reduce' });
    const tp = await context.newPage();
    shotPage = tp;
    const cdp = await context.newCDPSession(tp);
    const touch = (type, points) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], id) => ({ x, y, id, radiusX: 1, radiusY: 1, force: 1 })) });
    const gesture = async (from, to, steps = 8) => {
      await touch('touchStart', from);
      for (let i = 1; i <= steps; i++) {
        await touch('touchMove', from.map(([x, y], k) => [x + ((to[k][0] - x) * i) / steps, y + ((to[k][1] - y) * i) / steps]));
      }
      await touch('touchEnd', []);
      await tp.waitForTimeout(60);
    };
    const doubleTap = async (x, y) => {
      await tp.waitForTimeout(350);
      for (let i = 0; i < 2; i++) {
        await touch('touchStart', [[x, y]]);
        await touch('touchEnd', []);
        await tp.waitForTimeout(60);
      }
      await tp.waitForTimeout(60);
    };
    await tp.goto(`${base}?fixture=lightbox${dir === 'rtl' ? '&dir=rtl' : ''}`, { waitUntil: 'networkidle' });
    await tp.waitForSelector('.os-lightbox__stage[data-status="loaded"]', { timeout: 3000 }).catch(() => null);

    let m = await measureLightbox(tp);
    check(m.open && m.status === 'loaded' && !!m.img, `${tag}: viewer did not open with a loaded image (${m.status})`);
    if (!m.open || !m.img) {
      if (shots.has(tag)) shots.set(tag, await shots.get(tag));
      await context.close();
      shotPage = null;
      continue;
    }
    const screen = { left: 0, top: 0, right: m.vw, bottom: m.vh };
    // Full screen, nothing sideways, the image inside the stage, every control on screen and at least 44px.
    check(Math.abs(m.panel.width - m.vw) < 1 && Math.abs(m.panel.height - m.vh) < 1, `${tag}: panel ${m.panel.width}×${m.panel.height} is not full screen`);
    check(m.pageScrollWidth <= m.vw, `${tag}: page scrolls sideways (${m.pageScrollWidth} > ${m.vw})`);
    check(within(m.img, m.stage) && m.img.width > 100 && m.img.height > 100, `${tag}: image ${JSON.stringify(m.img)} doesn't fit the stage ${JSON.stringify(m.stage)}`);
    for (const c of m.controls) {
      check(c.width >= 44 && c.height >= 44, `${tag}: ${c.name} is ${c.width}×${c.height}, below 44px`);
      // Thumbnails may scroll inside their strip; everything else must be on screen.
      if (!c.thumb) check(within(c, screen), `${tag}: ${c.name} is off screen ${JSON.stringify(c)}`);
    }
    check(within(m.thumbs, screen), `${tag}: thumbnail strip leaves the viewport`);
    check(!!m.caption && m.caption.top >= m.stage.bottom - 0.5 && m.caption.bottom <= m.thumbs.top + 0.5, `${tag}: caption is not between the stage and the strip`);
    const prevBtn = m.controls.find((c) => c.name === 'Previous image');
    const nextBtn = m.controls.find((c) => c.name === 'Next image');
    check(!!prevBtn && !!nextBtn && (dir === 'ltr' ? prevBtn.left < nextBtn.left : prevBtn.left > nextBtn.left), `${tag}: previous is not on the inline-start side`);

    // Swipe: toward the inline start shows the next image (finger to the left in LTR, to the right in RTL).
    const cx = m.stage.left + m.stage.width / 2;
    const cy = m.stage.top + m.stage.height / 2;
    const span = Math.min(120, m.stage.width / 3);
    await gesture([[cx + span, cy]], [[cx - span, cy]]);
    m = await measureLightbox(tp);
    check(m.counter === (dir === 'ltr' ? '4 of 5' : '2 of 5'), `${tag}: swiping left shows "${m.counter}"`);
    await gesture([[cx - span, cy]], [[cx + span, cy]]);
    m = await measureLightbox(tp);
    check(m.counter === '3 of 5', `${tag}: swiping back right shows "${m.counter}"`);
    await gesture([[cx + 15, cy]], [[cx - 15, cy]]);
    m = await measureLightbox(tp);
    check(m.counter === '3 of 5', `${tag}: a 30px drag counted as a swipe ("${m.counter}")`);

    // Pinch: spreading two fingers zooms about 3×, and doesn't navigate.
    await tp.waitForTimeout(350);
    await gesture(
      [
        [cx - 30, cy],
        [cx + 30, cy],
      ],
      [
        [cx - 90, cy],
        [cx + 90, cy],
      ],
    );
    m = await measureLightbox(tp);
    const pinched = scaleOf(m.transform);
    check(pinched > 2.5 && pinched <= 4.01 && m.zoomed, `${tag}: pinch zoomed to ${pinched.toFixed(2)}×, expected about 3×`);
    check(m.counter === '3 of 5', `${tag}: pinch changed the image to "${m.counter}"`);

    // Pan while zoomed: a one-finger drag moves the image and no longer swipes.
    const before = translateOf(m.transform);
    await gesture([[cx, cy]], [[cx - 80, cy - 40]]);
    m = await measureLightbox(tp);
    const after = translateOf(m.transform);
    check(after[0] < before[0] - 20, `${tag}: dragging while zoomed did not pan (${before} → ${after})`);
    check(m.counter === '3 of 5', `${tag}: dragging while zoomed changed the image to "${m.counter}"`);
    // Clamped: however far you drag, the zoomed image still reaches the stage's edge.
    await gesture([[cx, cy]], [[cx - 2000, cy]], 12);
    m = await measureLightbox(tp);
    check(m.img.right >= m.stage.right - 1, `${tag}: panned past the image edge (image right ${m.img.right}, stage right ${m.stage.right})`);

    // Double tap: resets when zoomed, then zooms to 2×.
    await doubleTap(cx, cy);
    m = await measureLightbox(tp);
    check(scaleOf(m.transform) === 1 && !m.zoomed, `${tag}: double tap did not reset the zoom (${m.transform})`);
    await doubleTap(cx, cy);
    m = await measureLightbox(tp);
    check(Math.abs(scaleOf(m.transform) - 2) < 0.01, `${tag}: double tap zoomed to ${scaleOf(m.transform)}×, expected 2×`);

    // Keyboard: 0 resets, + zooms, the arrows pan while zoomed and navigate when not.
    await tp.keyboard.press('0');
    await tp.keyboard.press('+');
    await tp.keyboard.press('+');
    m = await measureLightbox(tp);
    check(Math.abs(scaleOf(m.transform) - 2) < 0.01, `${tag}: + + zoomed to ${scaleOf(m.transform)}×, expected 2×`);
    const k0 = translateOf(m.transform);
    await tp.keyboard.press('ArrowLeft');
    m = await measureLightbox(tp);
    const k1 = translateOf(m.transform);
    check(k1[0] > k0[0] && m.counter === '3 of 5', `${tag}: ArrowLeft while zoomed did not pan (${k0} → ${k1}, ${m.counter})`);
    await tp.keyboard.press('0');
    await tp.keyboard.press('ArrowRight');
    m = await measureLightbox(tp);
    check(m.counter === (dir === 'ltr' ? '4 of 5' : '2 of 5') && !m.zoomed, `${tag}: ArrowRight after a reset shows "${m.counter}"`);

    // Broken image: the error state sits centered in the stage.
    await tp.keyboard.press('End');
    await tp.waitForSelector('.os-lightbox__stage[data-status="error"]', { timeout: 3000 }).catch(() => null);
    m = await measureLightbox(tp);
    check(m.status === 'error' && within(m.error, m.stage), `${tag}: broken image state missing or outside the stage`);
    if (m.error) {
      const off = Math.abs((m.error.left + m.error.right) / 2 - (m.stage.left + m.stage.right) / 2);
      check(off < 2, `${tag}: broken image state is ${off}px off center`);
    }
    // Finish any failure screenshot before the context goes away.
    if (shots.has(tag)) shots.set(tag, await shots.get(tag));
    await context.close();
    shotPage = null;
  }
}

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

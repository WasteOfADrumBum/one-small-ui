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
let passed = 0;
const check = (ok, message) => {
  if (ok) passed++;
  else failures.push(message);
};
const open = async (fixture) => {
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

await browser.close();
server.close();
await rm(outDir, { recursive: true, force: true });
for (const f of failures) console.log(`  FAIL ${f}`);
console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);

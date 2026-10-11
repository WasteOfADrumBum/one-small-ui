// Runs axe-core (WCAG 2.x A, AA and AAA rules) against every docs page in
// light and dark themes, using the built docs site in apps/docs/dist.
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

const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const root = fileURLToPath(new URL('../apps/docs/dist/', import.meta.url));
if (!existsSync(root)) {
  console.error('Build the docs first: npm run build');
  process.exit(1);
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = join(root, path === '/' ? 'index.html' : path);
  try {
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
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
  executablePath: existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
    : undefined,
});
let total = 0;
for (const theme of ['dark', 'light']) {
  const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript((t) => localStorage.setItem('onesmallui-theme', t), theme);
  for (const route of routes) {
    await page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() =>
      // eslint-disable-next-line no-undef
      axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      }),
    );
    const violations = result.violations;
    total += violations.length;
    const tag = `${theme.padEnd(5)} ${route}`;
    if (violations.length === 0) console.log(`  ok   ${tag}`);
    for (const v of violations) {
      console.log(`  FAIL ${tag}: [${v.impact}] ${v.id} — ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`         ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1] ?? ''}`);
    }
    if (shots) await page.screenshot({ path: join(shots, `${theme}-${route.replace('/', '-')}.png`), fullPage: true });
  }
  await context.close();
}
await browser.close();
server.close();
console.log(total ? `\n${total} violation(s).` : '\nNo axe violations at WCAG A, AA or AAA.');
process.exit(total ? 1 : 0);

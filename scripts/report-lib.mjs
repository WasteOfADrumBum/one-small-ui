// Writes a self-contained HTML report of failures (with screenshots) for the Playwright scripts.
// CI uploads playwright-report/ as an artifact when a check fails.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const reportRoot = fileURLToPath(new URL('../playwright-report/', import.meta.url));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** failures: { title, details?: string[], screenshot?: Buffer }[] */
export async function writeReport(suite, failures, summary) {
  const items = failures
    .map(
      (f) => `<section><h2>${esc(f.title)}</h2>${
        f.details?.length ? `<ul>${f.details.map((d) => `<li><code>${esc(d)}</code></li>`).join('')}</ul>` : ''
      }${f.screenshot ? `<img alt="Screenshot: ${esc(f.title)}" src="data:image/png;base64,${f.screenshot.toString('base64')}">` : ''}</section>`,
    )
    .join('\n');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(suite)} report</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-inline-size:80rem}img{max-inline-size:100%;border:1px solid #888}section{margin-block:2rem}</style>
<h1>${esc(suite)}: ${esc(summary)}</h1>
${items}</html>`;
  const dir = `${reportRoot}${suite}/`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}index.html`, html);
  console.log(`Report: playwright-report/${suite}/index.html`);
}

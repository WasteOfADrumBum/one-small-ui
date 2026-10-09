// Writes machine-readable docs into the built site, from the same data the pages use:
//   apps/docs/dist/llms.txt        index (llmstxt.org format) with one line per page
//   apps/docs/dist/llms-full.txt   every page: summary, props, examples (source), a11y, classes
//   apps/docs/dist/components.json structured data for tools
// Run after `vite build` (the docs build script does this).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const docsRoot = fileURLToPath(new URL('../apps/docs/', import.meta.url));
const out = `${docsRoot}dist/`;
const site = 'https://one-small-ui.vercel.app';
if (!existsSync(out)) throw new Error('Build the docs first.');

const server = await createServer({ root: docsRoot, configFile: `${docsRoot}vite.config.ts`, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const { componentDocs, groups } = await server.ssrLoadModule('/src/site/componentDocs.ts');
await server.close();

const example = (name) => readFileSync(`${docsRoot}src/examples/${name}.tsx`, 'utf8').trim();
const pkg = JSON.parse(readFileSync(new URL('../packages/onesmallui/package.json', import.meta.url), 'utf8'));

const intro = `# OneSmallUI (1SmUI)

> ${pkg.description} npm: \`onesmallui\` v${pkg.version}. Import styles once with \`import 'onesmallui/styles.css'\`. Class prefix \`os-\`; variants are data attributes (\`data-variant\`, \`data-color\`, \`data-size\`). Themes: \`data-os-theme="light|dark"\` on any element. Colors: primary, secondary, accent, success, warning, danger, info, inverse (+ neutral).`;

const index = [intro, ''];
for (const g of groups) {
  index.push(`## ${g}`, '');
  for (const d of componentDocs.filter((x) => x.group === g)) index.push(`- [${d.name}](${site}/#components/${d.slug}): ${d.summary}`);
  index.push('');
}
index.push('## Optional', '', `- [Full documentation](${site}/llms-full.txt): every page with props and example source`, `- [Structured data](${site}/components.json)`, '');
writeFileSync(`${out}llms.txt`, index.join('\n'));

const full = [intro, ''];
for (const d of componentDocs) {
  full.push(`## ${d.name}`, '', `Group: ${d.group}. URL: ${site}/#components/${d.slug}`, '', d.summary, '');
  if (d.importLine) full.push('```tsx', d.importLine, '```', '');
  for (const p of d.props ?? []) {
    full.push(`### ${p.title} props`, '', '| Prop | Type | Default | Description |', '| --- | --- | --- | --- |');
    for (const r of p.props) full.push(`| ${r.name} | \`${r.type}\` | ${r.default ?? ''} | ${r.description} |`);
    full.push('');
  }
  for (const r of d.reference ?? []) {
    full.push(`### ${r.title}`, '', `| ${r.columns.join(' | ')} |`, `| ${r.columns.map(() => '---').join(' | ')} |`);
    for (const row of r.rows) full.push(`| ${row.join(' | ')} |`);
    full.push('');
  }
  for (const ex of d.examples) full.push(`### Example: ${ex.title}`, '', ...(ex.description ? [ex.description, ''] : []), '```tsx', example(ex.name), '```', '');
  for (const s of d.snippets ?? []) full.push(`### ${s.title}`, '', ...(s.description ? [s.description, ''] : []), '```' + s.language, s.code, '```', '');
  if (d.a11y.length) full.push('### Accessibility', '', ...d.a11y.map((a) => `- ${a}`), '');
  if (d.classes) full.push(`Classes: \`${d.classes}\``, '');
}
writeFileSync(`${out}llms-full.txt`, full.join('\n'));
writeFileSync(`${out}components.json`, JSON.stringify({ name: 'onesmallui', version: pkg.version, docs: componentDocs }, null, 2));
console.log(`llms.txt: ${componentDocs.length} pages`);

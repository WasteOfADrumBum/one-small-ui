// Verifies every text/background pairing in the theme tokens meets WCAG 2.2 AAA
// (7:1 for body text) and every UI boundary meets 3:1 (SC 1.4.11).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const themes = JSON.parse(
  readFileSync(fileURLToPath(new URL('../packages/onesmallui/tokens/themes.json', import.meta.url)), 'utf8'),
);

const luminance = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const surfaces = ['bg', 'surface', 'surface-2', 'surface-3'];
const statuses = ['primary', 'accent', 'success', 'warning', 'danger', 'info'];
const checks = [];
for (const s of surfaces) {
  checks.push(['text', s, 7], ['text-muted', s, 7], ['border-strong', s, 3], ['focus', s, 3]);
  for (const st of statuses) checks.push([`${st}-text`, s, 7]);
}
for (const st of statuses) {
  checks.push(
    [`on-${st}`, st, 7],
    [`on-${st}`, `${st}-hover`, 7],
    [`${st}-text`, `${st}-soft`, 7],
    ['text', `${st}-soft`, 7],
  );
}

let failures = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg, min] of checks) {
    const r = ratio(t[fg], t[bg]);
    if (r < min) {
      failures++;
      console.log(`FAIL ${name}: ${fg} (${t[fg]}) on ${bg} (${t[bg]}) = ${r.toFixed(2)} < ${min}`);
    }
  }
  console.log(`${name}: ${checks.length} pairs checked`);
}
if (failures) {
  console.error(`\n${failures} contrast failure(s).`);
  process.exit(1);
}
console.log('All token pairs meet WCAG AAA contrast.');

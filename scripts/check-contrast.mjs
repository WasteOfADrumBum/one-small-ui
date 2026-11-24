// Verifies every text/background pairing in the theme tokens meets WCAG 2.2 AAA
// (7:1 for body text) and every UI boundary meets 3:1 (SC 1.4.11).
// Only theme palettes are checked; the `motion` key is skipped (see tokens-lib.mjs).
// The pair list lives in tokens-lib.mjs and is shared with generate-theme.mjs.
import { CONTRAST_PAIRS, contrastFailures, readTokens } from './tokens-lib.mjs';

const { themes } = readTokens();

let failures = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const { fg, bg, min, ratio, fgValue, bgValue } of contrastFailures(t)) {
    failures++;
    console.log(`FAIL ${name}: ${fg} (${fgValue}) on ${bg} (${bgValue}) = ${ratio.toFixed(2)} < ${min}`);
  }
  console.log(`${name}: ${CONTRAST_PAIRS.length} pairs checked`);
}
if (failures) {
  console.error(`\n${failures} contrast failure(s).`);
  process.exit(1);
}
console.log('All token pairs meet WCAG AAA contrast.');

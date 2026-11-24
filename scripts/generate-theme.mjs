// Generates a OneSmallUI company theme from brand colors: an editable themes.json, CSS custom properties for
// light and dark, and Sass maps, then checks every contrast pair and prints the failures.
//
//   npm run theme:generate -- --primary '#0c5d56' [--secondary <hex>] [--accent <hex>] [--neutral <hex>]
//     [--primary-dark <hex> ...] [--success|--warning|--danger|--info <hex>] [--set dark.bg=#101216 ...]
//     [--config brand.json] [--out dir] [--prefix os] [--strict]
//   npm run theme:generate -- --from dir/themes.json [--out dir] [--strict]
//
// Run with --help for details. Exit codes: 0 written (failures are reported, not fatal), 1 --strict and at
// least one pair fails, 2 bad input.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { splitTokens } from './tokens-lib.mjs';
import {
  BRAND_COLORS,
  STATUS_COLORS,
  checkTheme,
  formatReport,
  generateTheme,
  normalizeOptions,
  toCss,
  toScss,
  toThemesJson,
} from './theme-lib.mjs';

const HELP = `Generate a OneSmallUI theme from brand colors.

Colors (hex, #rrggbb or #rgb). Each takes a -dark variant for dark mode, e.g. --primary-dark:
  --primary <hex>        Required. Light-mode primary; dark mode is derived unless --primary-dark is given.
  --secondary <hex>      Optional brand colors. Library defaults when left out.
  --accent <hex>
  --neutral <hex>        Tints surfaces, borders and text with this hue (library lightness is kept).
  --success, --warning, --danger, --info <hex>
                         Override the library's status colors (used unchanged otherwise).

Exact tokens:
  --set mode.token=<hex> Set any token exactly, e.g. --set dark.bg=#101216 (repeatable). Kept as given.

Other:
  --config <file.json>   Read the options above from JSON ({ "primary": "#...", "set": { "dark": { "bg": "#..." } } }).
                         Flags on the command line win.
  --from <themes.json>   Check an edited themes.json as given (no derivation) and regenerate the CSS and Sass.
  --out <dir>            Output directory (default: onesmallui-theme). Writes themes.json, theme.css, _theme.scss.
  --prefix <name>        CSS variable prefix (default: os, matching the library's $prefix).
  --strict               Exit 1 when any pair fails (files are still written).
  --help                 Show this help.

Colors you pass are never replaced. Derived tokens (hover, soft, text, on-, focus) are adjusted to pass.
When a color you passed can't pass, the report says so and offers the nearest passing color separately.`;

const colorFlags = [...BRAND_COLORS, ...STATUS_COLORS, 'neutral'].flatMap((name) => [name, `${name}-dark`]);
const options = {
  ...Object.fromEntries(colorFlags.map((name) => [name, { type: 'string' }])),
  set: { type: 'string', multiple: true },
  config: { type: 'string' },
  from: { type: 'string' },
  out: { type: 'string' },
  prefix: { type: 'string' },
  strict: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
};

function fail(message) {
  console.error(`generate-theme: ${message}\nRun with --help for usage.`);
  process.exit(2);
}

let values;
try {
  ({ values } = parseArgs({ options, strict: true, allowPositionals: false }));
} catch (error) {
  fail(error.message);
}
if (values.help) {
  console.log(HELP);
  process.exit(0);
}

let raw = {};
if (values.config) {
  try {
    raw = JSON.parse(readFileSync(values.config, 'utf8'));
  } catch (error) {
    fail(`could not read --config ${values.config}: ${error.message}`);
  }
}
const merged = { ...raw, ...Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) };
if (raw.set && values.set) {
  // Command-line --set entries add to (and win over) the config's.
  merged.set = Array.isArray(raw.set)
    ? [...raw.set, ...values.set]
    : [...Object.entries(raw.set).flatMap(([mode, t]) => Object.entries(t).map(([k, v]) => `${mode}.${k}=${v}`)), ...values.set];
}

const prefix = merged.prefix ?? 'os';
if (!/^[a-z][a-z0-9-]*$/i.test(prefix)) fail(`--prefix must be a CSS identifier, got "${prefix}"`);
const outDir = resolve(merged.out ?? 'onesmallui-theme');

let result;
try {
  if (merged.from) {
    const json = JSON.parse(readFileSync(merged.from, 'utf8'));
    result = checkTheme(splitTokens(json).themes);
  } else {
    result = generateTheme(normalizeOptions(merged));
  }
} catch (error) {
  fail(error.message);
}

mkdirSync(outDir, { recursive: true });
const files = [
  ['themes.json', toThemesJson(result.themes)],
  ['theme.css', toCss(result.themes, prefix)],
  ['_theme.scss', toScss(result.themes)],
].map(([name, content]) => {
  const path = join(outDir, name);
  writeFileSync(path, content);
  const rel = relative(process.cwd(), path);
  return rel && !rel.startsWith('..') ? rel : path;
});

console.log(formatReport(result, { files, from: merged.from }));
if (merged.strict && !result.report.passes) process.exit(1);

// node --test scripts/test/theme-lib.test.mjs   (part of npm run test:scripts)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CONTRAST_PAIRS,
  SURFACES,
  THEME_COLORS,
  contrastFailures,
  contrastRatio,
  readTokens,
} from '../tokens-lib.mjs';
import {
  BRAND_PAIRS,
  GENERATOR_PAIRS,
  checkTheme,
  formatReport,
  fromOklch,
  generateTheme,
  normalizeHex,
  normalizeOptions,
  toCss,
  toOklch,
  toScss,
  toThemesJson,
} from '../theme-lib.mjs';

const fixture = (name) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/theme/${name}.json`, import.meta.url)), 'utf8'));
const run = (name) => generateTheme(normalizeOptions(fixture(name)));
const library = readTokens().themes;
const SCRIPT = fileURLToPath(new URL('../generate-theme.mjs', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'os-theme-test-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

test('pair list: one shared list, the same 80 pairs check-contrast always ran, and the library passes it', () => {
  const expected = [];
  for (const s of SURFACES) {
    expected.push(['text', s, 7], ['text-muted', s, 7], ['border-strong', s, 3], ['focus', s, 3]);
    for (const c of THEME_COLORS) expected.push([`${c}-text`, s, 7]);
  }
  for (const c of THEME_COLORS) expected.push([`on-${c}`, c, 7], [`on-${c}`, `${c}-hover`, 7], [`${c}-text`, `${c}-soft`, 7], ['text', `${c}-soft`, 7]);
  assert.deepEqual(CONTRAST_PAIRS, expected);
  assert.equal(CONTRAST_PAIRS.length, 80);
  assert.deepEqual(GENERATOR_PAIRS.slice(0, 80), CONTRAST_PAIRS);
  assert.deepEqual(GENERATOR_PAIRS.slice(80), BRAND_PAIRS);
  for (const mode of ['light', 'dark']) assert.deepEqual(contrastFailures(library[mode], GENERATOR_PAIRS), []);
  assert.equal(checkTheme(library).report.passes, true);
});

test('color math: hex normalizing and OKLCH round trips', () => {
  assert.equal(normalizeHex('#ABC'), '#aabbcc');
  assert.equal(normalizeHex('0c5d56'), '#0c5d56');
  assert.throws(() => normalizeHex('teal'), /not a hex color/);
  assert.throws(() => normalizeHex('#12345'), /not a hex color/);
  for (const hex of ['#000000', '#ffffff', '#0c5d56', '#92310a', '#9333ea', '#ffe14d', '#72dccb', '#808080']) {
    assert.equal(fromOklch(toOklch(hex)), hex);
  }
  // Out of gamut: lightness and hue are kept, chroma is reduced until it fits.
  const clipped = fromOklch({ l: 0.9, c: 0.4, h: 150 });
  assert.match(clipped, /^#[0-9a-f]{6}$/);
  assert.ok(Math.abs(toOklch(clipped).l - 0.9) < 0.01);
});

test('options: primary is required, -dark and --set are parsed, bad input is refused', () => {
  assert.throws(() => normalizeOptions({}), /--primary is required/);
  assert.throws(() => normalizeOptions({ 'primary-dark': '#72dccb' }), /light-mode value/);
  assert.throws(() => normalizeOptions({ primary: '#0c5d56', set: ['bg=#fff'] }), /mode\.token=value/);
  assert.throws(() => normalizeOptions({ primary: '#0c5d56', set: ['dark.nope=#fff'] }), /unknown token/);
  assert.throws(() => normalizeOptions({ primary: '#0c5d56', set: ['sepia.bg=#fff'] }), /light\.<token> or dark\.<token>/);
  const opts = normalizeOptions({ primary: '#0C5D56', 'primary-dark': '72dccb', set: ['dark.bg=#101216'] });
  assert.deepEqual(opts.colors, { light: { primary: '#0c5d56' }, dark: { primary: '#72dccb' } });
  assert.deepEqual(opts.set.dark, { bg: '#101216' });
});

test('passing brand: every pair passes, brand values are kept, library defaults fill the rest', () => {
  const result = run('passing');
  const { themes, report } = result;
  assert.equal(report.passes, true);
  assert.equal(report.failureCount, 0);
  assert.deepEqual(report.givenFailures, []);
  assert.equal(themes.light.primary, '#0c5d56');
  assert.equal(themes.light.secondary, '#92310a');
  assert.equal(themes.light.accent, '#6d28d9');
  for (const mode of ['light', 'dark']) {
    assert.deepEqual(Object.keys(themes[mode]), Object.keys(library[mode]), `${mode} has the library's tokens in order`);
    assert.deepEqual(contrastFailures(themes[mode], GENERATOR_PAIRS), []);
    // Status colors, surfaces and text are the library's own when nothing overrides them.
    for (const token of ['success', 'on-success', 'warning-text', 'danger-soft', 'info-hover', 'bg', 'surface-3', 'text', 'text-muted', 'border-strong']) {
      assert.equal(themes[mode][token], library[mode][token], `${mode} ${token}`);
    }
  }
  // Dark values are derived from the light ones when not given, and are lighter.
  assert.ok(toOklch(themes.dark.primary).l >= 0.79);
  assert.equal(themes.light.focus, themes.light.primary);
  assert.match(formatReport(result), /Result: all 184 pairs pass in light and dark/);
});

test('failing brand: light yellow primary on white is kept, reported with its ratio and target, and a nearest passing color is offered', () => {
  const result = run('failing');
  const { themes, report } = result;
  assert.equal(report.passes, false);
  assert.equal(themes.light.primary, '#ffe14d', 'the brand color is never replaced');
  const light = report.modes.light.failures;
  assert.ok(light.length > 0);
  assert.ok(light.every((f) => f.fg === 'primary' && SURFACES.includes(f.bg) && f.min === 3));
  // Derived tokens were moved to pass: the focus ring is no longer the yellow, primary-text reads on surfaces.
  assert.notEqual(themes.light.focus, '#ffe14d');
  for (const s of SURFACES) {
    assert.ok(contrastRatio(themes.light.focus, themes.light[s]) >= 3);
    assert.ok(contrastRatio(themes.light['primary-text'], themes.light[s]) >= 7);
  }
  const offer = report.givenFailures.find((g) => g.mode === 'light' && g.token === 'primary');
  assert.ok(offer, 'the report names the brand color that cannot pass');
  assert.equal(offer.value, '#ffe14d');
  assert.match(offer.suggestion, /^#[0-9a-f]{6}$/);
  assert.notEqual(offer.suggestion, '#ffe14d');
  // The suggestion really passes once used.
  const retry = generateTheme(normalizeOptions({ ...fixture('failing'), primary: offer.suggestion }));
  assert.deepEqual(retry.report.modes.light.failures, []);
  const text = formatReport(result);
  assert.match(text, /FAIL light: primary \(#ffe14d\) on surface \(#ffffff\) = 1\.30 < 3/);
  assert.match(text, new RegExp(`light primary #ffe14d: .*nearest passing: ${offer.suggestion}`));
  assert.match(text, /does not meet the contrast targets yet/);
  assert.doesNotMatch(text, /pairs pass in light and dark/);
});

test('dark-only problem: light passes, dark primary is kept and reported, the suggestion fixes dark', () => {
  const { themes, report } = run('dark-only');
  assert.deepEqual(report.modes.light.failures, []);
  assert.deepEqual(
    report.modes.dark.failures.map((f) => `${f.fg}/${f.bg}`),
    ['on-primary/primary'],
  );
  assert.equal(themes.light.primary, '#0c5d56');
  assert.equal(themes.dark.primary, '#2563eb');
  assert.equal(report.givenFailures.length, 1);
  const [offer] = report.givenFailures;
  assert.equal(offer.mode, 'dark');
  assert.equal(offer.token, 'primary');
  const retry = generateTheme(normalizeOptions({ ...fixture('dark-only'), 'primary-dark': offer.suggestion }));
  assert.equal(retry.report.passes, true);
});

test('real consumer (TaskForge): every value given is kept, failures point at the values to change', () => {
  const config = fixture('taskforge');
  const { themes, report } = run('taskforge');
  for (const [token, value] of Object.entries({ primary: config.primary, secondary: config.secondary, accent: config.accent })) {
    assert.equal(themes.light[token], value);
  }
  assert.equal(themes.dark.primary, config['primary-dark']);
  assert.equal(themes.dark.secondary, config['secondary-dark']);
  assert.equal(themes.dark.accent, config['accent-dark']);
  for (const [token, value] of Object.entries(config.set.dark)) assert.equal(themes.dark[token], value);
  // Unset dark surfaces keep the library's steps above the surfaces TaskForge set.
  const l = (token) => toOklch(themes.dark[token]).l;
  assert.ok(l('bg') < l('surface') && l('surface') < l('surface-2') && l('surface-2') < l('surface-3'));
  // Every failing pair involves a value TaskForge gave, and each is offered a passing replacement.
  const blamed = report.givenFailures.map((g) => `${g.mode}.${g.token}`).sort();
  assert.deepEqual(blamed, ['dark.text-muted', 'light.accent']);
  for (const g of report.givenFailures) assert.match(g.suggestion, /^#[0-9a-f]{6}$/);
  const fixed = generateTheme(
    normalizeOptions({
      ...config,
      accent: report.givenFailures.find((g) => g.token === 'accent').suggestion,
      set: { dark: { ...config.set.dark, 'text-muted': report.givenFailures.find((g) => g.token === 'text-muted').suggestion } },
    }),
  );
  assert.equal(fixed.report.passes, true);
});

test('overrides: status colors and neutrals', () => {
  const { themes, report } = generateTheme(normalizeOptions({ primary: '#0c5d56', danger: '#b00020', neutral: '#5b6472' }));
  assert.equal(report.passes, true);
  assert.equal(themes.light.danger, '#b00020');
  assert.notEqual(themes.light['danger-hover'], library.light['danger-hover']);
  // The neutral re-tints surfaces and text but keeps the library's lightness steps.
  assert.notEqual(themes.light.bg, library.light.bg);
  for (const token of ['bg', 'surface-2', 'text', 'border']) {
    assert.ok(Math.abs(toOklch(themes.light[token]).l - toOklch(library.light[token]).l) < 0.03, token);
  }
});

test('output: themes.json, CSS and Sass carry the same palette', () => {
  const { themes } = run('passing');
  const json = JSON.parse(toThemesJson(themes));
  assert.deepEqual(json, { light: themes.light, dark: themes.dark });
  const css = toCss(themes);
  assert.match(css, /:root,\n\[data-os-theme="light"\],\n\.os-scheme-light \{\n {2}color-scheme: light;/);
  assert.match(css, /\[data-os-theme="dark"\],\n\.os-scheme-dark \{/);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-os-theme="light"\]\)/);
  assert.match(css, /--os-primary: #0c5d56;/);
  assert.equal(css.match(/--os-bg:/g).length, 3);
  assert.match(toCss(themes, 'brand'), /\[data-brand-theme="dark"\][\s\S]*--brand-primary:/);
  const scss = toScss(themes);
  assert.match(scss, /\$theme-light: \(\n {2}'bg': #f4f6fb,/);
  assert.match(scss, /\$theme-dark: \(/);
  assert.match(scss, /'primary': #0c5d56,/);
});

test('--from: an edited themes.json is checked as given and every failure gets a suggestion', () => {
  const edited = structuredClone(run('passing').themes);
  edited.dark['text-muted'] = '#6b7280';
  const { themes, report } = checkTheme(edited);
  assert.equal(themes.dark['text-muted'], '#6b7280');
  assert.equal(report.passes, false);
  assert.ok(report.modes.dark.failures.every((f) => f.fg === 'text-muted'));
  const [offer] = report.givenFailures;
  assert.equal(offer.token, 'text-muted');
  edited.dark['text-muted'] = offer.suggestion;
  assert.equal(checkTheme(edited).report.passes, true);
  assert.throws(() => checkTheme({ light: library.light }), /no "dark" palette/);
});

test('CLI: writes the three files, --strict exits 1 on failures, bad input exits 2', () => {
  const config = fileURLToPath(new URL('./fixtures/theme/failing.json', import.meta.url));
  const out = join(tmp, 'failing');
  const loose = spawnSync(process.execPath, [SCRIPT, '--config', config, '--out', out], { encoding: 'utf8' });
  assert.equal(loose.status, 0, loose.stderr);
  for (const f of ['themes.json', 'theme.css', '_theme.scss']) assert.ok(existsSync(join(out, f)), f);
  assert.match(loose.stdout, /FAIL light: primary/);
  const strict = spawnSync(process.execPath, [SCRIPT, '--config', config, '--out', out, '--strict'], { encoding: 'utf8' });
  assert.equal(strict.status, 1);
  // Flags win over the config file.
  const passing = spawnSync(process.execPath, [SCRIPT, '--config', config, '--primary', '#0c5d56', '--out', join(tmp, 'p'), '--strict'], { encoding: 'utf8' });
  assert.equal(passing.status, 0, passing.stdout);
  // --from regenerates the same CSS from the written themes.json.
  const again = join(tmp, 'again');
  const from = spawnSync(process.execPath, [SCRIPT, '--from', join(out, 'themes.json'), '--out', again], { encoding: 'utf8' });
  assert.equal(from.status, 0, from.stderr);
  assert.equal(readFileSync(join(again, 'theme.css'), 'utf8'), readFileSync(join(out, 'theme.css'), 'utf8'));
  const bad = spawnSync(process.execPath, [SCRIPT, '--primary', 'teal', '--out', join(tmp, 'bad')], { encoding: 'utf8' });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /not a hex color/);
  const unknown = spawnSync(process.execPath, [SCRIPT, '--primray', '#0c5d56'], { encoding: 'utf8' });
  assert.equal(unknown.status, 2);
});

// Company theme generation: derives a complete OneSmallUI palette (light and dark) from brand colors,
// checks it with the shared contrast pair list, and renders it as themes.json, CSS and a Sass map.
// Used by generate-theme.mjs (the CLI) and scripts/test/theme-lib.test.mjs. No dependencies.
//
// Rules:
// - Colors the caller passes (brand colors, status overrides, --set tokens) are kept exactly as given. When
//   one can't pass, the report says so and offers the nearest passing color separately.
// - Everything else (hover, soft, text and on- colors, focus, a dark value derived from a light one, tints
//   from a neutral) is derived, and may be moved in lightness until its pairs pass.
// - Page surfaces (bg, surface, surface-2, surface-3) are never moved automatically.
import {
  CONTRAST_PAIRS,
  SURFACES,
  THEME_COLORS,
  contrastFailures,
  contrastRatio,
  readTokens,
} from './tokens-lib.mjs';

export const MODES = ['light', 'dark'];
/** Brand roles the caller can set. */
export const BRAND_COLORS = ['primary', 'secondary', 'accent'];
/** Status colors; the library's own values are used unless overridden. */
export const STATUS_COLORS = ['success', 'warning', 'danger', 'info'];
/** Colors that take a value (and a -dark value) from the caller. */
const COLOR_INPUTS = [...BRAND_COLORS, ...STATUS_COLORS];
/** Surface, border and text tokens; library defaults unless a neutral or --set changes them. */
export const NEUTRAL_TOKENS = ['bg', 'surface', 'surface-2', 'surface-3', 'border', 'border-strong', 'text', 'text-muted'];
/** Tokens that hold any CSS color (rgba) and are not contrast-checked. */
export const FREE_TOKENS = ['glow', 'overlay', 'grid-line'];

/**
 * Brand fills are the visible boundary of solid buttons, checked checkboxes, switches and progress bars, so
 * the generator also checks primary, secondary and accent against every surface at 3:1 (SC 1.4.11). The
 * library's status colors keep their own rules (warning is a light fill used with dark text).
 */
export const BRAND_PAIRS = BRAND_COLORS.flatMap((c) => SURFACES.map((s) => [c, s, 3]));
/** Everything the generator checks: the shared list from tokens-lib.mjs plus the brand boundaries. */
export const GENERATOR_PAIRS = [...CONTRAST_PAIRS, ...BRAND_PAIRS];

// ---------- Color math (sRGB <-> OKLab/OKLCH) ----------

/** Normalizes `#abc`, `abc`, `#aabbcc` or `aabbcc` to lowercase `#aabbcc`; throws on anything else. */
export function normalizeHex(input) {
  const s = String(input ?? '').trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(s)) return `#${[...s].map((ch) => ch + ch).join('')}`;
  if (/^[0-9a-f]{6}$/.test(s)) return `#${s}`;
  throw new Error(`"${input}" is not a hex color (use #rrggbb or #rgb)`);
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const rgbToHex = (rgb) =>
  `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('')}`;

/** `#rrggbb` to OKLCH `{ l, c, h }` (l 0 to 1, h in degrees). */
export function toOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

function oklchToLinear({ l: L, c, h }) {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** OKLCH to `#rrggbb`. Out-of-gamut colors keep their lightness and hue and lose chroma until they fit. */
export function fromOklch({ l, c, h }) {
  const L = Math.min(1, Math.max(0, l));
  let lin = oklchToLinear({ l: L, c, h });
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ l: L, c: mid, h }))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear({ l: L, c: lo, h });
  }
  return rgbToHex(lin.map((v) => fromLinear(Math.min(1, Math.max(0, v)))));
}

/** Same hue and chroma at another OKLCH lightness. */
const withLightness = (hex, l) => {
  const o = toOklch(hex);
  return fromOklch({ ...o, l });
};

/** `rgba()` from a hex color and an alpha. */
const rgba = (hex, alpha) => `rgba(${hexToRgb(hex).map((v) => Math.round(v * 255)).join(', ')}, ${alpha})`;

// ---------- Searching for a passing color ----------

/** Lowest `ratio / min` over the constraints (1 or more means every constraint passes). */
const scoreOf = (value, constraints) =>
  constraints.reduce((worst, { other, min }) => Math.min(worst, contrastRatio(value, other) / min), Infinity);

/**
 * The color closest in OKLCH lightness to `value` (same hue, chroma clipped to sRGB) that meets every
 * constraint (`{ other, min }`). Returns `{ value, score, passes }`; when nothing passes, the best attempt.
 */
export function nearestPassing(value, constraints, { step = 0.0025 } = {}) {
  const start = toOklch(value);
  let best = { value, score: scoreOf(value, constraints) };
  if (best.score >= 1) return { ...best, passes: true };
  for (let i = 1; i * step <= 1; i++) {
    for (const sign of [-1, 1]) {
      const l = start.l + sign * i * step;
      if (l < 0 || l > 1) continue;
      const candidate = fromOklch({ ...start, l });
      const score = scoreOf(candidate, constraints);
      if (score >= 1) return { value: candidate, score, passes: true };
      if (score > best.score) best = { value: candidate, score };
    }
  }
  // Pure black and white sit at the ends of the search; make sure they were considered.
  for (const candidate of ['#000000', '#ffffff']) {
    const score = scoreOf(candidate, constraints);
    if (score > best.score) best = { value: candidate, score };
  }
  return { ...best, passes: best.score >= 1 };
}

/** Every pair a token takes part in, as constraints against the current values of the other tokens. */
const constraintsFor = (t, token, pairs) =>
  pairs.flatMap(([fg, bg, min]) => (fg === token ? [{ other: t[bg], min }] : bg === token ? [{ other: t[fg], min }] : []));

// ---------- Deriving tokens ----------

/**
 * Library token re-tinted with a neutral: the library's lightness (shifted by `dl`), the neutral's hue and a
 * gentle chroma, so surfaces stay neutral and the library's light-to-dark steps are kept.
 */
function tint(libraryHex, neutralHex, dl = 0) {
  const lib = toOklch(libraryHex);
  const n = toOklch(neutralHex);
  return fromOklch({ l: lib.l + dl, c: Math.min(n.c, lib.c + 0.01), h: n.h });
}

/**
 * Neutral tokens in ladders. An unset token follows the nearest set token of its own ladder, or of its
 * fallback ladder when its own has none (border follows the surfaces).
 */
const NEUTRAL_LADDERS = [
  { tokens: ['bg', 'surface', 'surface-2', 'surface-3'] },
  { tokens: ['border'], fallback: 0 },
  { tokens: ['border-strong', 'text-muted', 'text'] },
];

/** Dark-mode value for a brand color given only in light mode: same hue, lifted to at least L 0.8. */
export function darkFromLight(hex) {
  const o = toOklch(hex);
  return fromOklch({ ...o, l: Math.max(o.l, 0.8) });
}

/** Fills `<c>`, `<c>-hover`, `on-<c>`, `<c>-soft` and `<c>-text` from a base color. */
function deriveColor(t, name, base, mode) {
  const o = toOklch(base);
  t[name] = base;
  const darkOn = fromOklch({ l: 0.16, c: Math.min(o.c * 0.6, 0.05), h: o.h });
  const on = contrastRatio('#ffffff', base) >= contrastRatio(darkOn, base) ? '#ffffff' : darkOn;
  t[`on-${name}`] = on;
  // Hover darkens in light mode and lightens in dark mode, unless that would cost the on- color contrast.
  const dir = mode === 'light' ? -1 : 1;
  const hover = withLightness(base, o.l + dir * 0.06);
  const opposite = withLightness(base, o.l - dir * 0.06);
  t[`${name}-hover`] =
    contrastRatio(on, hover) < 7 && contrastRatio(on, opposite) > contrastRatio(on, hover) ? opposite : hover;
  t[`${name}-soft`] =
    mode === 'light'
      ? fromOklch({ l: 0.955, c: Math.min(o.c * 0.3, 0.045), h: o.h })
      : fromOklch({ l: 0.27, c: Math.min(o.c * 0.45, 0.07), h: o.h });
  const textConstraints = [...SURFACES.map((s) => ({ other: t[s], min: 7 })), { other: t[`${name}-soft`], min: 7 }];
  t[`${name}-text`] = nearestPassing(base, textConstraints).value;
}

/** Inverse group from the (changed) neutrals: text color as the fill, page background as its text. */
function deriveInverse(t, mode) {
  const text = toOklch(t.text);
  t.inverse = t.text;
  t['inverse-hover'] = withLightness(t.text, text.l + (mode === 'light' ? 0.12 : -0.12));
  t['on-inverse'] = t.bg;
  t['inverse-soft'] = fromOklch({ l: mode === 'light' ? 0.91 : 0.28, c: Math.min(text.c, 0.02), h: text.h });
  t['inverse-text'] = t.text;
}

/**
 * Moves derived tokens (never given ones or page surfaces) in lightness until their pairs pass, or as close
 * as they get. Returns the tokens it changed, `{ token: { from, to } }`.
 */
function solve(t, given, pairs) {
  const moved = {};
  const movable = (token) => !given.has(token) && !SURFACES.includes(token);
  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (const { fg, bg, min } of contrastFailures(t, pairs)) {
      if (contrastRatio(t[fg], t[bg]) >= min) continue; // fixed earlier in this pass
      for (const token of [fg, bg]) {
        if (!movable(token)) continue;
        const constraints = constraintsFor(t, token, pairs);
        const result = nearestPassing(t[token], constraints);
        if (result.value !== t[token] && result.score > scoreOf(t[token], constraints)) {
          moved[token] ??= { from: t[token] };
          moved[token].to = result.value;
          t[token] = result.value;
          changed = true;
        }
        if (contrastRatio(t[fg], t[bg]) >= min) break;
      }
    }
    if (!changed) break;
  }
  for (const [token, { from, to }] of Object.entries(moved)) if (from === to) delete moved[token];
  return moved;
}

/**
 * Builds one mode's palette. `opts` is the normalized input (see normalizeOptions). Returns
 * `{ tokens, given, notes, moved }`.
 */
export function buildMode(mode, opts, library = readTokens().themes) {
  const lib = library[mode];
  const t = { ...lib };
  const given = new Set();
  const notes = [];
  const sets = opts.set[mode] ?? {};

  // Surfaces, borders and text. Set tokens are kept; the others in the same ladder keep the library's steps
  // from the nearest set token, tinted with the neutral (or that token's hue when no neutral is given).
  const neutral = opts.neutral[mode] ?? (mode === 'dark' ? opts.neutral.light : undefined);
  const derivedNeutrals = [];
  for (const { tokens, fallback } of NEUTRAL_LADDERS) {
    let ladder = tokens;
    let anchors = ladder.filter((k) => k in sets);
    if (!anchors.length && fallback !== undefined) {
      // Follow the top (most raised) set token of the fallback ladder.
      ladder = NEUTRAL_LADDERS[fallback].tokens;
      anchors = ladder.filter((k) => k in sets).slice(-1);
    }
    for (const k of tokens) {
      if (k in sets) {
        t[k] = sets[k];
        given.add(k);
        continue;
      }
      const i = ladder.includes(k) ? ladder.indexOf(k) : ladder.length;
      const anchor = [...anchors].sort((a, b) => Math.abs(ladder.indexOf(a) - i) - Math.abs(ladder.indexOf(b) - i))[0];
      if (!anchor && !neutral) continue;
      const dl = anchor ? toOklch(sets[anchor]).l - toOklch(lib[anchor]).l : 0;
      t[k] = tint(lib[k], neutral ?? sets[anchor], dl);
      derivedNeutrals.push(k);
    }
  }
  if (derivedNeutrals.length) notes.push({ token: derivedNeutrals.join(', '), kind: 'derived-neutral', from: neutral });
  const neutralsChanged = derivedNeutrals.length > 0 || NEUTRAL_TOKENS.some((k) => k in sets);
  if (neutralsChanged) {
    deriveInverse(t, mode);
    t.overlay = mode === 'light' ? rgba(t.text, 0.55) : lib.overlay;
    t['grid-line'] = mode === 'light' ? rgba(t.text, 0.05) : rgba(t['border-strong'], 0.08);
  }

  // Brand and status colors.
  for (const name of COLOR_INPUTS) {
    const own = opts.colors[mode][name];
    const fromLight = mode === 'dark' && !own ? opts.colors.light[name] : undefined;
    if (own) {
      deriveColor(t, name, own, mode);
      given.add(name);
    } else if (fromLight) {
      deriveColor(t, name, darkFromLight(fromLight), mode);
      notes.push({ token: name, kind: 'derived-dark', from: fromLight, value: t[name] });
    } else if (neutralsChanged) {
      // Library color on new surfaces: keep its base, re-derive the rest against the new surfaces.
      deriveColor(t, name, lib[name], mode);
    }
  }
  // The focus ring follows primary, as in the library (moved below if it misses 3:1 on a surface).
  t.focus = t.primary;
  t.glow = rgba(t.primary, mode === 'light' ? 0.18 : 0.28);

  // Everything else the caller set explicitly.
  for (const [k, v] of Object.entries(sets)) {
    if (!NEUTRAL_TOKENS.includes(k)) {
      t[k] = v;
      if (!FREE_TOKENS.includes(k)) given.add(k);
    }
  }

  const moved = solve(t, given, GENERATOR_PAIRS);
  for (const name of COLOR_INPUTS) {
    const note = notes.find((n) => n.token === name && n.kind === 'derived-dark');
    if (note) note.value = t[name];
  }
  if (!given.has('focus') && t.focus !== t.primary) notes.push({ token: 'focus', kind: 'focus-adjusted', from: t.primary, value: t.focus });
  return { tokens: t, given, notes, moved };
}

// ---------- Input ----------

/**
 * Normalizes caller options (CLI flags or a config file):
 * `{ primary, 'primary-dark', secondary, ..., neutral, 'neutral-dark', set: ['dark.bg=#101216'] | { dark: { bg } } }`
 * to `{ colors: { light, dark }, neutral: { light, dark }, set: { light, dark } }`. Throws on bad input.
 */
export function normalizeOptions(raw, library = readTokens().themes) {
  const opts = { colors: { light: {}, dark: {} }, neutral: {}, set: { light: {}, dark: {} } };
  for (const name of [...COLOR_INPUTS, 'neutral']) {
    for (const [key, mode] of [
      [name, 'light'],
      [`${name}-dark`, 'dark'],
    ]) {
      if (raw[key] === undefined || raw[key] === null || raw[key] === '') continue;
      const value = normalizeHex(raw[key]);
      if (name === 'neutral') opts.neutral[mode] = value;
      else opts.colors[mode][name] = value;
    }
  }
  const known = Object.keys(library.light);
  const addSet = (mode, token, value) => {
    if (!MODES.includes(mode)) throw new Error(`--set needs light.<token> or dark.<token>, got "${mode}.${token}"`);
    if (!known.includes(token)) throw new Error(`--set: unknown token "${token}"`);
    opts.set[mode][token] = FREE_TOKENS.includes(token) ? String(value).trim() : normalizeHex(value);
  };
  const sets = raw.set ?? [];
  if (Array.isArray(sets)) {
    for (const entry of sets) {
      const match = /^(\w+)\.([\w-]+)=(.+)$/.exec(String(entry).trim());
      if (!match) throw new Error(`--set expects mode.token=value (for example dark.bg=#101216), got "${entry}"`);
      addSet(match[1], match[2], match[3]);
    }
  } else {
    for (const [mode, tokens] of Object.entries(sets)) for (const [token, value] of Object.entries(tokens)) addSet(mode, token, value);
  }
  if (!opts.colors.light.primary && !opts.colors.dark.primary) throw new Error('--primary is required');
  if (!opts.colors.light.primary) throw new Error('--primary (the light-mode value) is required; --primary-dark is optional');
  return opts;
}

// ---------- Generating and reporting ----------

const groupOf = (token) => {
  for (const c of THEME_COLORS) if ([c, `${c}-hover`, `on-${c}`, `${c}-soft`, `${c}-text`].includes(token)) return c;
  return null;
};

/** Failures (after building) that involve `token`, or for a theme color, any token of its group. */
function failuresFor(tokens, token) {
  const group = COLOR_INPUTS.includes(token) ? token : null;
  return contrastFailures(tokens, GENERATOR_PAIRS).filter(
    ({ fg, bg }) => fg === token || bg === token || (group && (groupOf(fg) === group || groupOf(bg) === group)),
  );
}

/** Candidate values by distance in lightness from `value`, nearest first. */
function* byLightness(value, step = 0.0025) {
  const start = toOklch(value);
  const seen = new Set();
  for (let i = 1; i * step <= 1; i++) {
    for (const sign of [-1, 1]) {
      const l = start.l + sign * i * step;
      if (l < 0 || l > 1) continue;
      const candidate = fromOklch({ ...start, l });
      if (!seen.has(candidate)) {
        seen.add(candidate);
        yield candidate;
      }
    }
  }
}

/**
 * Nearest passing replacement for a value the caller gave: the closest color in lightness (same hue) with
 * which, after re-deriving everything else, no pair involving it fails. `null` when none exists.
 */
function suggestFor(mode, token, opts, library, tokens) {
  const isColor = COLOR_INPUTS.includes(token);
  const withValue = (value) => {
    const next = structuredClone(opts);
    if (isColor && next.colors[mode][token]) next.colors[mode][token] = value;
    else next.set[mode][token] = value;
    return next;
  };
  // Cheap prefilter: a theme color needs some on- color at 7:1 (and brand colors 3:1 on every surface);
  // anything else must meet its pairs against the current values of the tokens around it.
  const quick = isColor
    ? (value) =>
        Math.max(contrastRatio(value, '#ffffff'), contrastRatio(value, '#000000')) >= 7 &&
        (!BRAND_COLORS.includes(token) || SURFACES.every((s) => contrastRatio(value, tokens[s]) >= 3))
    : (value) => scoreOf(value, constraintsFor(tokens, token, GENERATOR_PAIRS)) >= 1;
  let tries = 0;
  for (const candidate of byLightness(tokens[token])) {
    if (!quick(candidate)) continue;
    if (++tries > 40) break;
    const built = buildMode(mode, withValue(candidate), library);
    if (failuresFor(built.tokens, token).length === 0) return candidate;
  }
  return null;
}

/**
 * Generates both modes from normalized options and checks them. Returns
 * `{ themes, report: { pairsPerMode, modes: { light, dark }, givenFailures, failureCount, passes } }`.
 */
export function generateTheme(opts, library = readTokens().themes) {
  const themes = {};
  const report = { pairsPerMode: GENERATOR_PAIRS.length, modes: {}, givenFailures: [], failureCount: 0 };
  for (const mode of MODES) {
    const built = buildMode(mode, opts, library);
    themes[mode] = built.tokens;
    const failures = contrastFailures(built.tokens, GENERATOR_PAIRS);
    report.modes[mode] = { failures, notes: built.notes, moved: built.moved, given: [...built.given] };
    report.failureCount += failures.length;
    // Values the caller gave that take part in a failing pair, each with its nearest passing color.
    const blamed = new Set();
    for (const { fg, bg } of failures) {
      if (built.given.has(fg)) blamed.add(fg);
      else if (built.given.has(bg)) blamed.add(bg);
      else {
        // A derived on-/hover/soft/text token that couldn't pass usually means the given base can't.
        const group = groupOf(fg) ?? groupOf(bg);
        if (group && built.given.has(group)) blamed.add(group);
      }
    }
    for (const token of blamed) {
      const worst = failures
        .filter(({ fg, bg }) => fg === token || bg === token || groupOf(fg) === token || groupOf(bg) === token)
        .sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
      report.givenFailures.push({
        mode,
        token,
        value: built.tokens[token],
        worst,
        suggestion: suggestFor(mode, token, opts, library, built.tokens),
      });
    }
  }
  report.passes = report.failureCount === 0;
  return { themes, report };
}

/** Checks a complete themes.json-shaped palette as given (no derivation), for `--from`. */
export function checkTheme(themes, library = readTokens().themes) {
  const report = { pairsPerMode: GENERATOR_PAIRS.length, modes: {}, givenFailures: [], failureCount: 0 };
  const checked = {};
  for (const mode of MODES) {
    if (!themes[mode]) throw new Error(`the theme file has no "${mode}" palette`);
    const t = { ...themes[mode] };
    const missing = Object.keys(library[mode]).filter((k) => !(k in t));
    if (missing.length) throw new Error(`the "${mode}" palette is missing ${missing.join(', ')}`);
    for (const [k, v] of Object.entries(t)) {
      if (FREE_TOKENS.includes(k)) continue;
      try {
        t[k] = normalizeHex(v);
      } catch (error) {
        throw new Error(`${mode}.${k}: ${error.message}`, { cause: error });
      }
    }
    checked[mode] = t;
    const failures = contrastFailures(t, GENERATOR_PAIRS);
    report.modes[mode] = { failures, notes: [], moved: {}, given: Object.keys(t) };
    report.failureCount += failures.length;
    // Suggest a change to the foreground; when no foreground with its hue can pass, to the background
    // (never a page surface), as with white text on a mid-tone fill.
    const suggestions = new Map();
    const suggest = (token) => {
      if (!suggestions.has(token)) {
        const result = nearestPassing(t[token], constraintsFor(t, token, GENERATOR_PAIRS));
        suggestions.set(token, result.passes ? result.value : null);
      }
      return suggestions.get(token);
    };
    const blamed = new Map();
    for (const f of failures) {
      const token = suggest(f.fg) || SURFACES.includes(f.bg) || !suggest(f.bg) ? f.fg : f.bg;
      const prev = blamed.get(token);
      if (!prev || f.ratio / f.min < prev.ratio / prev.min) blamed.set(token, f);
    }
    for (const [token, worst] of blamed) {
      report.givenFailures.push({ mode, token, value: t[token], worst, suggestion: suggest(token) });
    }
  }
  report.passes = report.failureCount === 0;
  return { themes: checked, report };
}

// ---------- Output ----------

/** Editable themes.json-shaped JSON (light and dark palettes, library key order). */
export const toThemesJson = (themes) => `${JSON.stringify({ light: themes.light, dark: themes.dark }, null, 2)}\n`;

const declarations = (t, prefix, indent) =>
  Object.entries(t)
    .map(([k, v]) => `${indent}--${prefix}-${k}: ${v};`)
    .join('\n');

/** CSS custom properties for both modes; load it after `@onesmall/ui/styles.css`. */
export function toCss(themes, prefix = 'os') {
  const attr = (mode) => `[data-${prefix}-theme="${mode}"]`;
  return [
    '/* Generated by OneSmallUI scripts/generate-theme.mjs. Edit themes.json and re-run with --from to regenerate.\n' +
      ' * Load after @onesmall/ui/styles.css. Unlayered rules override the library tokens in the os.tokens layer. */',
    `:root,\n${attr('light')},\n.${prefix}-scheme-light {\n  color-scheme: light;\n${declarations(themes.light, prefix, '  ')}\n}`,
    `${attr('dark')},\n.${prefix}-scheme-dark {\n  color-scheme: dark;\n${declarations(themes.dark, prefix, '  ')}\n}`,
    `@media (prefers-color-scheme: dark) {\n  :root:not(${attr('light')}) {\n    color-scheme: dark;\n${declarations(themes.dark, prefix, '    ')}\n  }\n}`,
    '',
  ].join('\n\n').replace(/\n\n$/, '\n');
}

const sassMap = (name, t) => `$${name}: (\n${Object.entries(t).map(([k, v]) => `  '${k}': ${v},`).join('\n')}\n);\n`;

/** Sass maps shaped like the library's `$theme-light` / `$theme-dark`. */
export function toScss(themes) {
  return [
    '// Generated by OneSmallUI scripts/generate-theme.mjs. Edit themes.json and re-run with --from to regenerate.',
    '//',
    "//   @use 'theme' as brand;",
    "//   @use '@onesmall/ui/scss' with ($theme-light: brand.$theme-light, $theme-dark: brand.$theme-dark);",
    '',
    sassMap('theme-light', themes.light),
    sassMap('theme-dark', themes.dark),
  ].join('\n');
}

const fmt = (r) => r.toFixed(2);

/** Human-readable report. Never says the theme passes while any pair fails. */
export function formatReport({ report }, { files = [], from } = {}) {
  const lines = [];
  lines.push(from ? `OneSmallUI theme check: ${from}` : 'OneSmallUI theme generator');
  for (const mode of MODES) {
    const m = report.modes[mode];
    if (!from && m.given.length) lines.push(`  ${mode}: given ${m.given.join(', ')}`);
    for (const note of m.notes) {
      if (note.kind === 'derived-dark') lines.push(`  ${mode}: ${note.token} ${note.value} derived from light ${note.from} (pass --${note.token}-dark to set it)`);
      if (note.kind === 'derived-neutral') lines.push(`  ${mode}: ${note.token} derived ${note.from ? `from neutral ${note.from}` : 'from the tokens you set'}, keeping the library's steps`);
      if (note.kind === 'focus-adjusted') lines.push(`  ${mode}: focus ${note.value} (primary ${note.from} is below 3:1 on a surface, so the ring was darkened or lightened)`);
    }
  }
  if (files.length) {
    lines.push('', 'Wrote:');
    for (const f of files) lines.push(`  ${f}`);
  }
  lines.push('', `Contrast: ${report.pairsPerMode} pairs per mode (text 7:1, UI boundaries 3:1)`);
  for (const mode of MODES) {
    const { failures } = report.modes[mode];
    lines.push(`  ${mode}: ${report.pairsPerMode - failures.length} pass, ${failures.length} fail`);
    for (const f of failures) {
      lines.push(`  FAIL ${mode}: ${f.fg} (${f.fgValue}) on ${f.bg} (${f.bgValue}) = ${fmt(f.ratio)} < ${f.min}`);
    }
  }
  if (report.givenFailures.length) {
    lines.push('', from ? 'Values that fail as given (not changed):' : 'Colors you gave that cannot pass as given (kept as given, not replaced):');
    for (const g of report.givenFailures) {
      const why = g.worst ? `${g.worst.fg} on ${g.worst.bg} reaches ${fmt(g.worst.ratio)}:1, needs ${g.worst.min}:1` : 'fails a pair';
      const flag = COLOR_INPUTS.includes(g.token) ? `--${g.token}${g.mode === 'dark' ? '-dark' : ''} '${g.suggestion}'` : `--set ${g.mode}.${g.token}=${g.suggestion}`;
      const offer = g.suggestion
        ? `nearest passing: ${g.suggestion}${from ? '' : ` (to use it: ${flag})`}`
        : 'no passing color with the same hue; pick another color';
      lines.push(`  ${g.mode} ${g.token} ${g.value}: ${why}; ${offer}`);
    }
  }
  lines.push('');
  if (report.passes) {
    lines.push(`Result: all ${report.pairsPerMode * MODES.length} pairs pass in light and dark. This checks color contrast only.`);
  } else {
    lines.push(`Result: ${report.failureCount} pair(s) fail. This theme does not meet the contrast targets yet.`);
  }
  return lines.join('\n');
}

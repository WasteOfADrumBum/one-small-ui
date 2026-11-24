// Reads tokens/themes.json, the single token source. Theme palettes are the
// top-level entries; the reserved `motion` key holds durations (ms) and easings
// and is never a theme. Shared by build-tokens.mjs, check-contrast.mjs and
// generate-theme.mjs. Also holds the contrast pair list and the WCAG contrast
// math, so check-contrast.mjs and generate-theme.mjs check exactly the same pairs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const TOKENS_FILE = fileURLToPath(new URL('../packages/onesmallui/tokens/themes.json', import.meta.url));

/** Keys of themes.json that are not themes. */
export const RESERVED_KEYS = ['motion'];

/** Splits the token JSON into `{ themes, motion }`. */
export function splitTokens(json) {
  const themes = {};
  for (const [key, value] of Object.entries(json)) if (!RESERVED_KEYS.includes(key)) themes[key] = value;
  return { themes, motion: json.motion ?? { duration: {}, easing: {} } };
}

export const readTokens = () => splitTokens(JSON.parse(readFileSync(TOKENS_FILE, 'utf8')));

// ---------- Contrast ----------

/** WCAG 2 relative luminance of a `#rrggbb` color. */
export const luminance = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/** WCAG 2 contrast ratio between two `#rrggbb` colors (1 to 21). */
export const contrastRatio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** Page backgrounds every foreground token must read on. */
export const SURFACES = ['bg', 'surface', 'surface-2', 'surface-3'];

/** The theme colors; each has `<c>`, `<c>-hover`, `on-<c>`, `<c>-soft` and `<c>-text` tokens. */
export const THEME_COLORS = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

/**
 * Every pair a theme must meet, as `[foreground, background, minimum ratio]`: text at 7:1 (WCAG 2.2 AAA,
 * SC 1.4.6) and UI boundaries (`border-strong`, `focus`) at 3:1 (SC 1.4.11).
 */
export const CONTRAST_PAIRS = (() => {
  const pairs = [];
  for (const s of SURFACES) {
    pairs.push(['text', s, 7], ['text-muted', s, 7], ['border-strong', s, 3], ['focus', s, 3]);
    for (const c of THEME_COLORS) pairs.push([`${c}-text`, s, 7]);
  }
  for (const c of THEME_COLORS) {
    pairs.push([`on-${c}`, c, 7], [`on-${c}`, `${c}-hover`, 7], [`${c}-text`, `${c}-soft`, 7], ['text', `${c}-soft`, 7]);
  }
  return pairs;
})();

/** Runs a pair list on one theme palette and returns every pair below its minimum, in list order. */
export function contrastFailures(theme, pairs = CONTRAST_PAIRS) {
  const failures = [];
  for (const [fg, bg, min] of pairs) {
    const ratio = contrastRatio(theme[fg], theme[bg]);
    if (ratio < min) failures.push({ fg, bg, min, ratio, fgValue: theme[fg], bgValue: theme[bg] });
  }
  return failures;
}

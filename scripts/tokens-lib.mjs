// Reads tokens/themes.json, the single token source. Theme palettes are the
// top-level entries; the reserved `motion` key holds durations (ms) and easings
// and is never a theme. Shared by build-tokens.mjs and check-contrast.mjs.
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

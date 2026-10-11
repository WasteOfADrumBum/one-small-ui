// @vitest-environment node
// tokens/themes.json is the single token file (published as @onesmall/ui/tokens.json).
// Its reserved "motion" key must never be treated as a theme.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { motion, themes } from '../src';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const pkg = fileURLToPath(new URL('../', import.meta.url));
const json = JSON.parse(readFileSync(`${pkg}tokens/themes.json`, 'utf8'));
const node = (args: string[]) => execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' });

describe('tokens/themes.json', () => {
  it('keeps motion next to the themes, and the generated module splits them', () => {
    expect(Object.keys(json).sort()).toEqual(['dark', 'light', 'motion']);
    expect(Object.keys(themes).sort()).toEqual(['dark', 'light']);
    expect(motion).toEqual(json.motion);
    expect(Object.keys(motion.duration)).toEqual(['fast', 'base', 'slow']);
    expect(Object.keys(motion.easing)).toEqual(['standard', 'enter', 'exit']);
  });

  it('the shared reader used by build-tokens and check-contrast skips motion', () => {
    const out = node([
      '--input-type=module',
      '-e',
      "import { readTokens } from './scripts/tokens-lib.mjs'; const t = readTokens(); console.log(JSON.stringify({ themes: Object.keys(t.themes), motion: Object.keys(t.motion) }));",
    ]);
    expect(JSON.parse(out)).toEqual({ themes: ['light', 'dark'], motion: ['duration', 'easing'] });
    for (const script of ['build-tokens.mjs', 'check-contrast.mjs']) {
      expect(readFileSync(`${root}scripts/${script}`, 'utf8')).toContain("from './tokens-lib.mjs'");
    }
  });

  it('check:contrast checks only the light and dark themes', () => {
    const out = node(['scripts/check-contrast.mjs']);
    expect(out).toMatch(/^light: \d+ pairs checked$/m);
    expect(out).toMatch(/^dark: \d+ pairs checked$/m);
    expect(out).not.toMatch(/motion/);
  });

  it('the generated SCSS motion maps match the JSON and the theme maps leave motion out', () => {
    const scss = readFileSync(`${pkg}scss/abstracts/_motion.scss`, 'utf8');
    for (const [k, v] of Object.entries(json.motion.duration)) expect(scss).toContain(`'${k}': ${v}ms,`);
    for (const [k, v] of Object.entries(json.motion.easing)) expect(scss).toContain(`'${k}': ${v},`);
    expect(readFileSync(`${pkg}scss/abstracts/_themes.scss`, 'utf8')).not.toContain('motion');
  });
});

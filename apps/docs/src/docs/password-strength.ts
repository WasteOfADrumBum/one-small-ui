import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'password-strength',
  order: 61,
  name: 'PasswordStrength',
  group: 'Forms',
  summary:
    'A segmented or progress-bar strength meter with text feedback and a configurable rules checklist, updating live and announcing politely. The look is CSS-only via data-strength, so it also works without JavaScript.',
  importLine: "import { PasswordStrength, usePasswordStrength, scorePassword } from 'onesmallui';",
  examples: [
    { name: 'password-strength-basic', title: 'Live meter, bar variant and custom rules' },
    { name: 'password-strength-static', title: 'Static, CSS-only markup' },
  ],
  props: [
    {
      title: 'PasswordStrength',
      props: [
        { name: 'value', type: 'string', description: 'Required. The password to rate.' },
        { name: 'variant', type: "'segments' | 'bar'", default: "'segments'", description: 'Meter style.' },
        { name: 'rules', type: '{ id, label, test: RegExp | (pw) => boolean }[]', default: 'defaultPasswordRules', description: 'Criteria (8+ chars, lower, upper, number, symbol by default).' },
        { name: 'showRules', type: 'boolean', description: 'Checklist with checkmarks.' },
        { name: 'showLabel', type: 'boolean', default: 'true', description: '"Password strength: Good" text.' },
        { name: 'labels', type: 'Partial<Record<level, string>>', description: 'Rename weak/fair/good/strong.' },
        { name: 'meterLabel', type: 'string', default: "'Password strength'", description: 'Accessible name of the meter.' },
        { name: 'announceDelay', type: 'number', default: '800', description: 'Debounce before announcing, in ms.' },
        { name: 'score', type: '(pw, met, total) => number', description: 'Custom 0–4 scoring.' },
      ],
    },
    {
      title: 'usePasswordStrength(password, { rules?, score? })',
      props: [{ name: 'returns', type: '{ score: 0–4, level, rules: { id, label, met }[], valid }', description: 'Memoized result of scorePassword() for your own UI.' }],
    },
  ],
  a11y: [
    'The meter is role="meter" with aria-valuenow and aria-valuetext ("Good"); link it to the password input with aria-describedby.',
    'New strengths are announced in a polite live region only after typing pauses, so screen readers are not flooded.',
    'Rules show a check or dot icon and screen-reader text ("done" / "not yet"), not just color.',
    'Level colors use the -text tokens (7:1 against surfaces).',
  ],
  classes: `.os-password-strength[data-strength="empty|weak|fair|good|strong"][data-variant="segments|bar"]
  > .os-password-strength__meter > .os-password-strength__segment ×4 | .os-password-strength__bar
  > .os-password-strength__label > strong
  > .os-password-strength__rules > .os-password-strength__rule[data-met]`,
};

export default doc;

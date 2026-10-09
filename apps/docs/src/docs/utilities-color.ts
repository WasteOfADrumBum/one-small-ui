import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-color',
  order: 10,
  name: 'Color',
  group: 'Utilities',
  summary: 'Text and background colors for every theme role, soft and solid backgrounds, surfaces, gradients, on-color pairings, and color-scheme classes that switch a subtree to light or dark.',
  examples: [
    {
      name: 'color-text',
      title: 'Text colors',
    },
    {
      name: 'color-background',
      title: 'Backgrounds, pairings and gradients',
    },
    {
      name: 'color-scheme',
      title: 'Color scheme',
    },
  ],
  reference: [
    {
      title: 'Color classes',
      columns: ['Class', 'Effect'],
      rows: [
        [
          '.os-text-{primary,secondary,accent,success,warning,danger,info,inverse}',
          "Text in the role's -text shade (7:1 on every surface).",
        ],
        [
          '.os-text-default, .os-text-emphasis, .os-text-muted',
          'Body, high-emphasis and secondary text.',
        ],
        ['.os-text-inherit, .os-text-reset', 'Inherit the parent color.'],
        ['.os-bg-{color}', 'Solid role color. Pair with .os-text-bg-{color} for text.'],
        ['.os-bg-{color}-soft', 'Soft tint; body text and -text shades are 7:1 on it.'],
        [
          '.os-bg-bg, .os-bg-surface, .os-bg-surface-2, .os-bg-surface-3, .os-bg-transparent',
          'Surfaces.',
        ],
        ['.os-text-bg-{color}', 'Solid background with its on-color text.'],
        [
          '.os-bg-gradient, .os-bg-gradient-{color}',
          'Gradient (primary → accent, or color → hover shade) with on-color text.',
        ],
        [
          '.os-scheme-light, .os-scheme-dark',
          'Re-scope every token to that theme (like data-os-theme) and set text and background.',
        ],
        ['.os-gradient-text', 'Primary → accent gradient clipped to text (large display text only).'],
      ],
    },
  ],
  a11y: [
    'Every text/background pairing here is checked at 7:1 (AAA) in both themes by npm run check:contrast.',
    'Solid .os-bg-{color} has no text color; always pair it with .os-text-bg-{color}.',
    'Never use color as the only way to convey meaning (1.4.1): add text or an icon.',
  ],
};

export default doc;

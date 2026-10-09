import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'sass-api',
  order: 30,
  name: 'Sass & CSS API',
  group: 'Framework',
  summary:
    'Semantic color tokens as CSS variables, a Sass module system with maps, mixins and functions, and cascade layers so your CSS always wins without specificity fights.',
  examples: [],
  snippets: [
    {
      title: 'Configure with Sass modules',
      language: 'scss',
      description: 'Every variable is !default. Load the library once with your overrides.',
      code: `@use 'onesmallui/scss' with (
  $prefix: 'os',
  $radius-base: 6px,
  $font-sans: ('Inter', system-ui, sans-serif),
  $enable-layers: true,
  $enable-transitions: true,
  $enable-reduced-motion: true,
  $breakpoints: ('xs': 0, 'sm': 576px, 'md': 768px, 'lg': 1024px, 'xl': 1280px, '2xl': 1536px, '3xl': 1920px),
);`,
    },
    {
      title: 'Use the tools in your own Sass',
      language: 'scss',
      code: `@use 'onesmallui/scss/abstracts' as os;

.my-panel {
  padding: os.space('4');                  // spacing map
  border-radius: os.radius('lg');          // var(--os-radius-lg)
  background: os.token('surface-2');       // var(--os-surface-2)
  transition: transform os.dur('base') os.ease('standard');
  @include os.focus-ring;                  // AAA focus indicator
  @include os.up(md) { padding: os.space('8'); }

  &[data-tone] { @include os.color-vars('data-tone'); color: var(--_text); }
}`,
    },
    {
      title: 'Cascade layers',
      language: 'css',
      description:
        'Output order: os.tokens, os.reset, os.base, os.components, os.utilities. Unlayered app CSS beats all of them, and utilities beat components regardless of specificity.',
      code: `/* Your CSS, unlayered: wins without !important */
.os-btn { letter-spacing: 0; }

/* Or slot your own layer between components and utilities */
@layer os.components, app, os.utilities;
@layer app { .os-card { border-width: 2px; } }`,
    },
    {
      title: 'Semantic tokens',
      language: 'css',
      code: `/* Each color role has five tokens */
--os-primary  --os-primary-hover  --os-on-primary  --os-primary-soft  --os-primary-text
/* Roles: primary secondary accent success warning danger info inverse */
/* Surfaces and text: --os-bg --os-surface --os-surface-2 --os-surface-3 --os-border --os-border-strong --os-text --os-text-muted --os-focus */
/* Scales: --os-radius-* --os-duration-* --os-ease-* --os-text-* --os-shadow-* */`,
    },
  ],
  reference: [
    {
      title: 'Sass maps',
      columns: ['Map', 'Purpose'],
      rows: [
        ['$theme-light / $theme-dark', 'Color tokens (generated from tokens/themes.json)'],
        ['$theme-colors', 'List of color roles looped by every component'],
        ['$breakpoints', 'Media query breakpoints'],
        ['$spacers', 'Spacing scale used by utilities'],
        ['$font-sizes', 'Fluid type scale'],
        ['$radii, $durations, $easings', 'Shape and motion scales'],
        ['$z-index', 'Layering scale'],
      ],
    },
    {
      title: 'Mixins and functions',
      columns: ['Name', 'Purpose'],
      rows: [
        ['token($name)', 'var(--os-<name>)'],
        ['space($key), radius($key), dur($key), ease($key), z($key)', 'Scale lookups'],
        ['cls($name)', 'Prefixed class name'],
        ['@include up($bp) / down($bp)', 'Mobile-first media queries'],
        ['@include focus-ring', 'WCAG 2.4.13 focus indicator'],
        ['@include color-vars($attr)', 'Private --_c, --_on, --_soft, --_text per data-color'],
        ['@include glass', 'Frosted translucent surface'],
        ['@include visually-hidden', 'Screen-reader-only content'],
        ['@include reduced-motion', 'prefers-reduced-motion block'],
      ],
    },
  ],
  a11y: [],
};

export default doc;

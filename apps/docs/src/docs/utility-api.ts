import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utility-api',
  order: 80,
  name: 'Utility API',
  group: 'Utilities',
  summary: 'Every utility is generated from a Sass map by the public utilities() mixin. Add, override or remove utilities through $utilities when you compile the library, or call the mixin yourself to generate prefixed, responsive classes in your own stylesheet.',
  examples: [
    {
      name: 'utility-api',
      title: 'Adding utilities',
    },
  ],
  reference: [
    {
      title: 'Utility map keys',
      columns: ['Key', 'Meaning'],
      rows: [
        [
          'props',
          'A property, or a list of properties that all receive the value. Custom properties work too.',
        ],
        [
          'values',
          "Map of class suffix → value, or a plain list. A map value emits several declarations. The suffix '' gives the bare stem.",
        ],
        ['name', "Class stem: 'cursor' → .os-cursor-help."],
        ['bare', 'Use the suffix alone as the class (.os-flex).'],
        ['responsive', 'Also emit sm: … 2xl: variants ($responsive-breakpoints).'],
        ['container', 'Also emit cq-sm: … cq-xl: variants ($container-breakpoints).'],
        ['print', 'Also emit print: variants.'],
        ['child', "Selector appended to the class, e.g. '> * + *'."],
        ['var', 'Read the value from var(--os-<var>-<suffix>) instead.'],
        ['$utilities', 'Variable merged over the built-in map; set a key to null to remove that group.'],
        [
          'utilities($map, $breakpoints), utility($key, $config)',
          'Public mixins in onesmallui/scss/abstracts.',
        ],
      ],
    },
  ],
  a11y: [
    'Generated classes inherit nothing about accessibility: check contrast and focus visibility for any color or visibility utility you add.',
  ],
};

export default doc;

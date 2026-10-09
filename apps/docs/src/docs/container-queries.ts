import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'container-queries',
  order: 130,
  name: 'Container queries',
  group: 'Layout & media',
  summary: 'Components that respond to the space they are given, not the viewport. Mark a parent with .os-cq, then use cq-sm: (24rem), cq-md: (36rem), cq-lg: (48rem) or cq-xl: (64rem) on descendants.',
  examples: [
    {
      name: 'cq-basic',
      title: 'An adaptive card in two column widths',
    },
  ],
  reference: [
    {
      title: 'Container query support',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-cq', 'container-type: inline-size.'],
        [
          'cq-sm:, cq-md:, cq-lg:, cq-xl:',
          'Variants for display, flex direction, grid columns (.os-grid-cols-*) and .os-col / .os-col-*.',
        ],
        [
          '$container-breakpoints',
          'Sass map of the sizes; add "container": true to your own utilities to get variants.',
        ],
      ],
    },
  ],
  a11y: [
    'Container queries are layout only; keep the same content and order at every size so nothing is hidden from some users.',
  ],
};

export default doc;

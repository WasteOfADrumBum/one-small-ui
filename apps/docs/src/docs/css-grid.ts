import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'css-grid',
  order: 120,
  name: 'CSS Grid',
  group: 'Layout & media',
  summary: 'An alternative to the flexbox grid built on CSS Grid: .os-cssgrid with .os-g-col-* spans and .os-g-start-* starts. Gaps replace gutters, and the column count is a variable. The Grid component covers auto-fit layouts.',
  importLine: "import { Grid } from 'onesmallui';",
  examples: [
    {
      name: 'cssgrid-basic',
      title: 'Spans, starts and custom tracks',
    },
  ],
  reference: [
    {
      title: 'CSS Grid classes',
      columns: ['Class / variable', 'Effect'],
      rows: [
        ['.os-cssgrid', 'display: grid with --os-columns (12) equal tracks and --os-gap (1.5rem).'],
        ['.os-g-col-1 … .os-g-col-12', 'Span n tracks (responsive: sm: md: lg: xl: 2xl:).'],
        ['.os-g-start-1 … .os-g-start-11', 'Start at track n.'],
        ['--os-columns, --os-rows, --os-gap', 'Override inline or in your CSS.'],
        [
          '.os-grid-cols-*, .os-col-span-*, .os-col-start-*, .os-row-span-*',
          'Tailwind-style grid utilities (see Flex and grid utilities).',
        ],
      ],
    },
  ],
  a11y: [
    'Placement only moves things visually; keep DOM order logical for screen readers and keyboard users.',
  ],
};

export default doc;

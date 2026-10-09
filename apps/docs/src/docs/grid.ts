import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'grid',
  order: 110,
  name: 'Grid system',
  group: 'Layout & media',
  summary: 'A 12-column flexbox grid: .os-row with .os-col, .os-col-<n> and .os-col-auto, row columns, nesting, alignment, ordering, offsets and gutters, all with responsive md: prefixes.',
  examples: [
    {
      name: 'grid-columns',
      title: 'Equal, fixed and auto-width columns',
    },
    {
      name: 'grid-row-cols',
      title: 'Row columns and nesting',
    },
    {
      name: 'grid-alignment',
      title: 'Vertical and horizontal alignment',
    },
    {
      name: 'grid-order',
      title: 'Offsets and ordering',
    },
    {
      name: 'grid-gutters',
      title: 'Gutters',
    },
  ],
  reference: [
    {
      title: 'Grid classes (responsive: sm: md: lg: xl: 2xl:)',
      columns: ['Class', 'Effect'],
      rows: [
        [
          '.os-row',
          'Flex row that wraps; holds the gutter variables --os-gutter-x (1.5rem) and --os-gutter-y (0).',
        ],
        ['.os-col', 'Equal share of the remaining width.'],
        ['.os-col-1 … .os-col-12', 'Span n of 12 columns.'],
        ['.os-col-auto', 'Width of its content.'],
        ['.os-row-cols-1 … .os-row-cols-6, .os-row-cols-auto', 'Width of every child, set on the row.'],
        ['.os-offset-0 … .os-offset-11', 'Push a column by n twelfths (logical, flips in RTL).'],
        ['.os-order-first, .os-order-0 … 5, .os-order-last', 'Visual order.'],
        [
          '.os-g-*, .os-gx-*, .os-gy-*',
          'Gutters: 0, 1, 2, 3, 4, 6, 8, 12 on the spacing scale (.os-g-* is responsive).',
        ],
        ['.os-items-*, .os-self-*, .os-justify-*', 'Alignment utilities work on rows and columns.'],
        ['cq-sm: … cq-xl: .os-col-*', 'Column widths from the nearest .os-cq container.'],
      ],
    },
  ],
  a11y: [
    'Ordering and offsets change only the visual position. Screen readers and the Tab key follow DOM order, so keep the source order meaningful (WCAG 1.3.2, 2.4.3).',
    'Columns stack to full width on small screens by default, so content reflows at 320px without horizontal scrolling.',
  ],
};

export default doc;

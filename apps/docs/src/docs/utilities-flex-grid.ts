import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-flex-grid',
  order: 30,
  name: 'Flex and grid',
  group: 'Utilities',
  summary: 'Flex direction, wrapping, grow and shrink; align content, items and self; justify content, items and self; place items; gaps; grid templates, spans and line placement.',
  examples: [
    {
      name: 'flex-align',
      title: 'Flexbox',
    },
    {
      name: 'flex-grid-placement',
      title: 'Grid placement',
    },
  ],
  reference: [
    {
      title: 'Flex and grid classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-flex-{row,col,row-reverse,col-reverse}', 'flex-direction (responsive, cq-*:).'],
        ['.os-flex-{wrap,nowrap,wrap-reverse}', 'flex-wrap (responsive).'],
        [
          '.os-flex-{1,auto,initial,none}, .os-grow, .os-grow-0, .os-shrink, .os-shrink-0',
          'Flex sizing.',
        ],
        ['.os-items-{start,center,end,stretch,baseline}', 'align-items (responsive).'],
        ['.os-content-{start,center,end,between,around,stretch}', 'align-content (responsive).'],
        ['.os-self-{auto,start,center,end,stretch,baseline}', 'align-self (responsive).'],
        ['.os-justify-{start,center,end,between,around,evenly}', 'justify-content (responsive).'],
        ['.os-justify-items-*, .os-justify-self-*', 'Grid inline-axis alignment.'],
        ['.os-place-items-*, .os-place-content-*', 'Both axes at once.'],
        ['.os-gap-*, .os-gap-x-*, .os-gap-y-*', 'gap (responsive), column-gap, row-gap.'],
        [
          '.os-grid-cols-{1-6,12,none}, .os-grid-rows-{1-6,none}',
          'Templates (cols responsive and cq-*:).',
        ],
        ['.os-col-span-{1-12,full}, .os-row-span-{1-6,full}', 'Spans (col-span responsive).'],
        ['.os-col-start-*, .os-col-end-*, .os-row-start-* (1-13, auto)', 'Line placement.'],
        ['.os-grid-flow-{row,col,dense,row-dense}', 'Auto-placement.'],
        ['.os-order-*', 'Order (responsive).'],
      ],
    },
  ],
  a11y: [
    'Reordering with flex or grid changes only the visual order; keep the DOM order logical for keyboard and screen reader users.',
  ],
};

export default doc;

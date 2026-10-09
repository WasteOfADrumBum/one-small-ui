import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-layout',
  order: 20,
  name: 'Layout',
  group: 'Utilities',
  summary: 'Aspect ratio, display (responsive and print), float, object fit and position, overflow, position with edge offsets and centering, visibility and z-index.',
  examples: [
    {
      name: 'layout-ratio',
      title: 'Aspect ratio',
    },
    {
      name: 'layout-position',
      title: 'Position',
    },
    {
      name: 'layout-display',
      title: 'Display, float, overflow, visibility, object fit',
    },
  ],
  reference: [
    {
      title: 'Layout classes',
      columns: ['Class', 'Effect'],
      rows: [
        [
          '.os-ratio-{auto,1x1,4x3,3x2,16x9,21x9,9x16}',
          'aspect-ratio. Add .os-ratio on a wrapper to make its child fill it.',
        ],
        [
          '.os-block, .os-inline-block, .os-inline, .os-flex, .os-inline-flex, .os-grid, .os-inline-grid, .os-flow-root, .os-contents, .os-hidden',
          'display. Responsive (sm: md: lg: xl: 2xl:), container (cq-*:) and print: variants.',
        ],
        ['.os-float-{start,end,none}', 'Logical float, responsive. .os-clearfix on the parent.'],
        [
          '.os-object-{cover,contain,fill,scale-down,none}, .os-object-{center,top,bottom}',
          'object-fit / object-position.',
        ],
        [
          '.os-overflow-{hidden,auto,visible,scroll,clip}, .os-overflow-x-*, .os-overflow-y-*',
          'Overflow.',
        ],
        ['.os-static, .os-relative, .os-absolute, .os-fixed, .os-sticky', 'position.'],
        [
          '.os-top-*, .os-bottom-*, .os-start-*, .os-end-* (0, 50, 100, auto), .os-inset-0',
          'Edge offsets; start/end are logical.',
        ],
        ['.os-translate-middle, -x, -y', 'Center on the offset point (RTL aware).'],
        [
          '.os-visible, .os-invisible',
          'visibility (invisible keeps its space and hides from assistive tech).',
        ],
        ['.os-z-*', 'See the Z-index page.'],
      ],
    },
  ],
  a11y: [
    'Scrollable boxes need tabindex="0", a role and a label so keyboard users can scroll them.',
    '.os-hidden and .os-invisible also hide content from screen readers. To hide only visually, use .os-visually-hidden.',
  ],
};

export default doc;

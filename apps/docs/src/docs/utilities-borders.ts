import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-borders',
  order: 60,
  name: 'Borders',
  group: 'Utilities',
  summary: 'Border presence on all or logical sides, width, style and color (theme, subtle, strong), radius for all or per logical side, and dividers between children.',
  examples: [
    {
      name: 'borders-basic',
      title: 'Border, width, style and color',
    },
    {
      name: 'borders-radius',
      title: 'Radius and dividers',
    },
  ],
  reference: [
    {
      title: 'Border classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-border, .os-border-{top,bottom,start,end,x,y}', '1px border on all or one logical side.'],
        ['.os-border-0, .os-border-{top,bottom,start,end}-0', 'Remove borders.'],
        ['.os-border-{1,2,3,4}, .os-border-{solid,dashed,dotted}', 'Width and style.'],
        ['.os-border-{color}, .os-border-{color}-subtle', 'Theme colors.'],
        [
          '.os-border-{subtle,strong,current,transparent}',
          'Neutral colors (strong is 3:1 for UI boundaries).',
        ],
        ['.os-rounded, .os-rounded-{none,sm,md,lg,xl,full,circle,pill}', 'Radius on all corners.'],
        ['.os-rounded-{top,bottom,start,end}[-{none,sm,md,lg,full}]', 'Radius on one logical side.'],
        ['.os-divide-y, .os-divide-x, .os-divide-strong', 'Rules between children.'],
      ],
    },
  ],
  a11y: [
    'Borders that identify a control or its state need 3:1 against the background (1.4.11): use .os-border-strong or a solid theme color, not the subtle tones.',
  ],
};

export default doc;

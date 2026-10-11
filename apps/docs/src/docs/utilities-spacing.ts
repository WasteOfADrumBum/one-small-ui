import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-spacing',
  order: 40,
  name: 'Size and spacing',
  group: 'Utilities',
  summary: 'Width and height (percentages, auto, content and viewport sizes), margin and padding on the 0.25rem scale with logical sides, negative margins, and spacing between children.',
  examples: [
    {
      name: 'spacing-basic',
      title: 'Margin, padding, width and height',
    },
    {
      name: 'spacing-between',
      title: 'Space between children',
    },
  ],
  reference: [
    {
      title: 'Spacing scale',
      columns: ['Key', 'Value'],
      rows: [
        ['0, px, 0-5', '0, 1px, 0.125rem'],
        ['1, 2, 3, 4', '0.25, 0.5, 0.75, 1rem'],
        ['5, 6, 8, 10', '1.25, 1.5, 2, 2.5rem'],
        ['12, 16, 20, 24', '3, 4, 5, 6rem'],
      ],
    },
    {
      title: 'Size and spacing classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-m-*, .os-mx-*, .os-my-* (+ auto)', 'Margin; responsive.'],
        [
          '.os-mt-*, .os-mb-*, .os-ms-*, .os-me-* (+ auto)',
          'Block start/end, inline start/end (flip in RTL).',
        ],
        [
          '.os-m-n*, .os-mx-n*, .os-my-n*, .os-mt-n*, .os-mb-n*, .os-ms-n*, .os-me-n* (1, 2, 3, 4, 6, 8)',
          'Negative margins.',
        ],
        ['.os-p-*, .os-px-*, .os-py-*', 'Padding; responsive.'],
        [
          '.os-pt-*, .os-pb-*, .os-ps-*, .os-pe-*',
          'Logical padding sides. .os-pl-* / .os-pr-* stay physical for compatibility.',
        ],
        ['.os-space-y-*, .os-space-x-*', 'Margin before every child but the first (x is logical).'],
        ['.os-w-{25,50,75,100,full,auto,fit,min,max}', 'Width; responsive. .os-w-screen = 100vw.'],
        ['.os-min-w-{0,full,screen}, .os-max-w-{prose,sm,md,lg,xl,full,none}', 'Min/max width.'],
        ['.os-h-{25,50,75,100,full,screen,auto,fit}', 'Height (screen = 100dvh).'],
        ['.os-min-h-{0,full,screen}, .os-max-h-{full,screen,none}', 'Min/max height.'],
      ],
    },
  ],
  a11y: ['Prefer logical sides (s/e) so layouts mirror correctly in right-to-left languages.'],
};

export default doc;

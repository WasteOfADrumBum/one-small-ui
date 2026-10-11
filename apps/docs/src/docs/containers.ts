import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'containers',
  order: 100,
  name: 'Containers & breakpoints',
  group: 'Layout & media',
  summary: 'Containers center content with responsive side padding. .os-container steps its max width at each breakpoint, .os-container-<bp> is fluid until that breakpoint, and .os-container-fluid never caps.',
  importLine: "import { Container } from 'onesmallui';",
  examples: [
    {
      name: 'containers-basic',
      title: 'Containers',
    },
  ],
  reference: [
    {
      title: 'Breakpoints (mobile first, min-width)',
      columns: ['Prefix', 'Min width', 'Container max width'],
      rows: [
        ['(none)', '0', '100%'],
        ['sm:', '576px', '540px'],
        ['md:', '768px', '720px'],
        ['lg:', '1024px', '984px'],
        ['xl:', '1280px', '1240px'],
        ['2xl:', '1536px', '1440px'],
        ['3xl (media queries and hooks only)', '1920px', '—'],
      ],
    },
    {
      title: 'Container classes',
      columns: ['Class', 'Behavior'],
      rows: [
        [
          '.os-container',
          'Steps at every breakpoint (no data-size). Same as <Container size="responsive">.',
        ],
        ['.os-container-sm … .os-container-2xl', '100% wide until the breakpoint, then steps.'],
        ['.os-container-fluid', 'Always 100% wide.'],
        [
          '.os-container[data-size="sm|md|lg|xl|full"]',
          'Fixed max widths used by the Container component.',
        ],
      ],
    },
  ],
  a11y: [
    'Side padding scales with the viewport so content never touches the screen edge, and nothing scrolls horizontally at 320px (WCAG 1.4.10 Reflow).',
  ],
};

export default doc;

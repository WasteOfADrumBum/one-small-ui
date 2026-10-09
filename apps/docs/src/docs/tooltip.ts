import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tooltip',
  order: 100,
  name: 'Tooltip',
  group: 'Overlays',
  summary: 'Short descriptions on hover and focus.',
  importLine: "import { Tooltip } from 'onesmallui';",
  examples: [{ name: 'tooltip-basic', title: 'Placements' }],
  props: [
    {
      title: 'Tooltip',
      props: [
        { name: 'content', type: 'ReactNode', description: 'Tooltip text.' },
        { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Side.' },
        { name: 'delay', type: 'number', default: '300', description: 'Hover delay in ms (focus is instant).' },
      ],
    },
  ],
  a11y: [
    'Linked to its trigger with aria-describedby.',
    'Hoverable, persistent and dismissible with Escape (1.4.13).',
    'Never put essential information or interactive content in a tooltip.',
  ],
};

export default doc;

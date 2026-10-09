import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'badge',
  order: 30,
  name: 'Badge',
  group: 'Data display',
  summary: 'Compact status labels, with optional pulsing status dot.',
  importLine: "import { Badge } from 'onesmallui';",
  examples: [{ name: 'badge-basic', title: 'Colors, variants and dots' }],
  props: [
    {
      title: 'Badge',
      props: [
        { name: 'color', type: color, default: "'neutral'", description: 'Color role.' },
        { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Visual weight.' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size.' },
        { name: 'dot / pulse', type: 'boolean', description: 'Leading status dot, optionally animated.' },
      ],
    },
  ],
  a11y: ['Color is never the only signal: always include text.', 'The dot is decorative and hidden from assistive tech.'],
  classes: '.os-badge[data-color][data-variant]',
};

export default doc;

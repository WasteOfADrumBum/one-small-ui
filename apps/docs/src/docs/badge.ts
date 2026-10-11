import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'badge',
  order: 30,
  name: 'Badge',
  group: 'Data display',
  summary:
    'Compact status labels and counters. Soft (subtle), solid and outline variants in every theme color, em-based sizing for headings and buttons, and notification badges pinned to a corner.',
  importLine: "import { Badge, BadgeAnchor } from 'onesmallui';",
  examples: [
    { name: 'badge-basic', title: 'Colors, variants, sizes and dots' },
    { name: 'badge-inline', title: 'In headings and buttons', description: '`size="inherit"` follows the parent text size.' },
    {
      name: 'badge-positioned',
      title: 'Positioned notification badges',
      description: '`placement` pins a badge to a corner of a button, or of any content wrapped in `BadgeAnchor`. With `dot`, the badge is a bare indicator and its text is for screen readers only.',
    },
  ],
  props: [
    {
      title: 'Badge',
      props: [
        { name: 'color', type: color, default: "'neutral'", description: 'Color role.' },
        { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Visual weight (soft is the subtle tint).' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'inherit'", default: "'md'", description: '`inherit` sizes in em from the parent.' },
        { name: 'placement', type: "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'", description: 'Pins the badge to a corner of its parent. Logical: end is right in LTR, left in RTL.' },
        { name: 'dot / pulse', type: 'boolean', description: 'Leading status dot, optionally animated. With placement, a bare dot.' },
        { name: 'shape', type: "'pill' | 'rounded'", default: "'pill'", description: 'Corner style.' },
      ],
    },
    {
      title: 'BadgeAnchor',
      props: [{ name: '…span props', type: 'HTMLAttributes', description: 'Inline, position: relative wrapper for placed badges.' }],
    },
  ],
  a11y: [
    'Color is never the only signal: always include text.',
    'Counters need context for screen readers: "99+ unread messages", using visually hidden text where the visible label is just a number.',
    'Put notification badges inside the button they describe, so they become part of its accessible name. A bare dot keeps its children as screen-reader-only text.',
    'The leading dot is decorative and hidden from assistive tech.',
  ],
  classes: '.os-badge[data-color][data-variant][data-size][data-shape][data-placement][data-dot-only] > .os-badge__dot\n.os-badge-anchor',
};

export default doc;

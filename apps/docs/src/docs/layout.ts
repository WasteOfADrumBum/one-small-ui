import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'layout',
  order: 140,
  name: 'Container, Stack, Grid',
  group: 'Layout & media',
  summary: 'Responsive layout primitives with per-breakpoint props.',
  importLine: "import { Container, Stack, Grid } from 'onesmallui';",
  examples: [{ name: 'layout-grid', title: 'Responsive layout', description: 'Resize your window to see columns and direction change.' }],
  props: [
    {
      title: 'Grid',
      props: [
        { name: 'columns', type: 'number | { base, sm, md, lg, xl }', default: '1', description: 'Column count per breakpoint.' },
        { name: 'minItemWidth', type: 'string', description: 'Auto-fit columns at least this wide.' },
        { name: 'gap', type: 'SpaceKey | responsive', default: '4', description: 'Gap on the 0.25rem scale.' },
      ],
    },
    {
      title: 'Stack',
      props: [
        { name: 'direction', type: "'row' | 'column' | responsive", default: "'column'", description: 'Flow.' },
        { name: 'gap', type: 'SpaceKey | responsive', default: '4', description: 'Spacing.' },
        { name: 'align / justify', type: 'CSS', description: 'Alignment.' },
        { name: 'wrap', type: 'boolean', description: 'Allow wrapping.' },
      ],
    },
    {
      title: 'Container',
      props: [{ name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'xl'", description: 'Max width.' }],
    },
  ],
  a11y: ['Layout never reorders content visually away from DOM order, so reading and focus order stay logical.'],
};

export default doc;

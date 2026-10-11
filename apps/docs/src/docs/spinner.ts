import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'spinner',
  order: 122,
  name: 'Spinner',
  group: 'Feedback',
  summary:
    'Loading indicators: a spinning border ring or a growing dot, in five sizes and every theme color (or currentColor), customizable through CSS variables, inline or inside buttons.',
  importLine: "import { Spinner } from 'onesmallui';",
  examples: [
    { name: 'spinner-basic', title: 'Border and grow, sizes and colors' },
    {
      name: 'spinner-custom',
      title: 'Custom styling with CSS variables',
      description: '`--os-spinner-size`, `--os-spinner-thickness`, `--os-spinner-speed` and `--os-spinner-color`.',
    },
    { name: 'spinner-inline', title: 'Inline and in buttons' },
  ],
  props: [
    {
      title: 'Spinner',
      props: [
        { name: 'variant', type: "'border' | 'grow'", default: "'border'", description: 'Spinning ring or pulsing dot.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size (1.1em inside buttons).' },
        { name: 'color', type: `${status} | 'current'`, description: 'Theme color, or the surrounding text color. Defaults to primary, or current inside buttons.' },
        { name: 'label', type: 'string | null', default: "'Loading'", description: 'Announced via role="status". null when something else announces loading.' },
      ],
    },
  ],
  a11y: [
    'With a label, the spinner is role="status" and its text is announced politely. Pass label={null} when a nearby element (or a loading Button) already announces it, so it is not read twice.',
    'Spinner colors use the <color>-text tokens, which keep at least 7:1 on every surface.',
    'With reduced motion, spinners pulse slowly instead of spinning.',
  ],
  classes: '.os-spinner[data-variant][data-size][data-color] > .os-spinner__ring\n(--os-spinner-size, --os-spinner-thickness, --os-spinner-speed, --os-spinner-color)',
};

export default doc;

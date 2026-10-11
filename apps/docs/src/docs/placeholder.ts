import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'placeholder',
  order: 125,
  name: 'Placeholder & Skeleton',
  group: 'Feedback',
  summary:
    'Loading placeholders: Skeleton blocks for layout, and inline Placeholder text that follows the surrounding font. Adjustable width, size and color, with wave, pulse or no animation.',
  importLine: "import { Placeholder, Skeleton } from 'onesmallui';",
  examples: [
    { name: 'placeholder-basic', title: 'Loading a card', description: 'Placeholders stand in for text in the real markup, so the layout does not jump when content arrives.' },
    { name: 'placeholder-options', title: 'Animation, width, size and color' },
  ],
  props: [
    {
      title: 'Placeholder',
      props: [
        { name: 'width', type: 'number | string', default: '100', description: 'Number is a percentage; or any CSS width.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'inherit'", default: "'inherit'", description: 'Height relative to the surrounding text (em).' },
        { name: 'animation', type: "'wave' | 'pulse' | 'none'", default: "'wave'", description: 'Loading animation.' },
        { name: 'color', type: status, description: 'Tint.' },
      ],
    },
    {
      title: 'Skeleton',
      props: [
        { name: 'shape', type: "'text' | 'rect' | 'circle'", default: "'text'", description: 'Placeholder shape.' },
        { name: 'lines', type: 'number', default: '1', description: 'Text lines (the last is shorter).' },
        { name: 'width / height', type: 'CSS size', description: 'Dimensions.' },
        { name: 'animation', type: "'wave' | 'pulse' | 'none'", default: "'wave'", description: 'Loading animation.' },
        { name: 'color', type: status, description: 'Tint.' },
      ],
    },
  ],
  a11y: [
    'Placeholders and skeletons are aria-hidden. Set aria-busy="true" on the region that is loading and give it a name ("Loading crew profile"), then remove both when content arrives.',
    'For loads that take a while, also announce completion with a polite live region or move focus to the new content.',
    'Under reduced motion the wave and pulse stop; placeholders are still visible as solid blocks.',
  ],
  classes: '.os-placeholder[data-size][data-animation][data-color]\n.os-skeleton[data-shape][data-animation][data-color]  .os-skeleton-group',
};

export default doc;

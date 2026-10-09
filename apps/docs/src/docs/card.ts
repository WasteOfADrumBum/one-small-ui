import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'card',
  order: 20,
  name: 'Card',
  group: 'Data display',
  summary: 'Groups related content. Surface, glass, outline and elevated variants, plus interactive lift and an animated edge glow.',
  importLine: "import { Card, CardHeader, CardBody, CardFooter, CardMedia } from 'onesmallui';",
  examples: [
    { name: 'card-basic', title: 'Variants' },
    { name: 'card-interactive', title: 'Interactive, media and glow' },
  ],
  props: [
    {
      title: 'Card',
      props: [
        { name: 'variant', type: "'surface' | 'glass' | 'outline' | 'elevated'", default: "'surface'", description: 'Background treatment.' },
        { name: 'interactive', type: 'boolean', description: 'Lift and glow on hover and focus-within.' },
        { name: 'glow', type: 'boolean', description: 'Animated light along the top edge.' },
        { name: 'as', type: 'ElementType', default: "'div'", description: 'Render as article, section, li…' },
      ],
    },
  ],
  a11y: [
    'Use as="article" for standalone items so they appear in screen reader landmarks and outlines.',
    'For clickable cards, put one real link in the heading and add .os-stretched-link instead of an onClick on the card.',
  ],
  classes: '.os-card[data-variant] > .os-card__header | __body | __footer | __media',
};

export default doc;

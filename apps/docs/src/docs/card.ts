import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'card',
  order: 20,
  name: 'Card',
  group: 'Data display',
  summary:
    'Groups related content: body, title, text and link parts, header and footer, images and overlays, embedded lists and tabs, horizontal layout, theme colors, translucent glass, groups and grids.',
  importLine:
    "import { Card, CardHeader, CardBody, CardFooter, CardTitle, CardSubtitle, CardText, CardLink, CardImage, CardOverlay, CardMedia, CardGroup } from 'onesmallui';",
  examples: [
    { name: 'card-basic', title: 'Variants' },
    { name: 'card-content', title: 'Content parts, header and footer' },
    { name: 'card-images', title: 'Images and overlays' },
    { name: 'card-embedded', title: 'List groups and navigation inside cards' },
    { name: 'card-horizontal', title: 'Horizontal card' },
    {
      name: 'card-colors',
      title: 'Theme colors and translucent backgrounds',
      description: 'With a `color`, surface tints softly, solid fills, outline colors the border and glass gives a translucent tint.',
    },
    { name: 'card-group', title: 'Groups, grids and width' },
    { name: 'card-interactive', title: 'Interactive, media and glow' },
  ],
  props: [
    {
      title: 'Card',
      props: [
        { name: 'variant', type: "'surface' | 'glass' | 'outline' | 'elevated' | 'solid'", default: "'surface'", description: 'Background treatment. glass is translucent.' },
        { name: 'color', type: status, description: 'Theme color.' },
        { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Horizontal puts media beside content from sm up.' },
        { name: 'interactive', type: 'boolean', description: 'Lift and glow on hover and focus-within.' },
        { name: 'glow', type: 'boolean', description: 'Animated light along the top edge.' },
        { name: 'as', type: 'ElementType', default: "'div'", description: 'Render as article, section, li…' },
      ],
    },
    {
      title: 'Card parts',
      props: [
        { name: 'CardHeader / CardBody / CardFooter', type: 'as?: ElementType', description: 'Layout regions (header, div, footer).' },
        { name: 'CardTitle', type: 'as?: ElementType', default: "'h3'", description: 'Heading; choose the level that fits your outline.' },
        { name: 'CardSubtitle / CardText', type: 'as?: ElementType', default: "'p'", description: 'Secondary and body text.' },
        { name: 'CardLink', type: 'AnchorHTMLAttributes', description: 'Underlined links, 44px tall, side by side.' },
        { name: 'CardMedia', type: 'as?: ElementType', description: 'Wrapper for media like <Image>.' },
      ],
    },
    {
      title: 'CardImage',
      props: [
        { name: 'position', type: "'top' | 'bottom' | 'cover'", default: "'top'", description: 'Where it sits; cover fills behind a CardOverlay.' },
        { name: 'ratio', type: 'number', description: 'Aspect ratio, e.g. 16 / 9.' },
        { name: 'alt', type: 'string', description: 'Required; "" when decorative.' },
      ],
    },
    {
      title: 'CardOverlay',
      props: [{ name: 'align', type: "'start' | 'center' | 'end'", default: "'end'", description: 'Vertical position of the content over the image.' }],
    },
    {
      title: 'CardGroup',
      props: [
        { name: 'layout', type: "'attached' | 'grid'", default: "'attached'", description: 'Joined cards with equal heights, or an auto-fill grid.' },
        { name: 'minWidth', type: 'string', default: "'16rem'", description: 'Smallest column in the grid layout.' },
      ],
    },
  ],
  a11y: [
    'Use as="article" for standalone items so they appear in screen reader landmarks and outlines, and pick CardTitle heading levels that fit the page.',
    'For clickable cards, put one real link in the heading and add .os-stretched-link instead of an onClick on the card.',
    'Overlays always use dark-theme tokens on a dark scrim, so text stays at 7:1 whatever the photo. Give informative images real alt text.',
    'Tinted cards switch muted text to full text color, keeping 7:1 on every color.',
  ],
  classes:
    '.os-card[data-variant][data-color][data-orientation] > .os-card__header | __body | __footer | __media | __img[data-position] | __overlay[data-align]\n.os-card__title  .os-card__subtitle  .os-card__text  .os-card__link\n.os-card-group[data-layout]  (--os-card-min, --os-card-media-size)',
};

export default doc;

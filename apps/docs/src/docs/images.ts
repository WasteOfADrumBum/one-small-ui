import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'images',
  order: 20,
  name: 'Images',
  group: 'Content',
  summary: 'Responsive images and lightweight image styling for plain <img> elements. For lazy loading, modern formats and blur-up, use the Image component.',
  examples: [
    {
      name: 'images-basic',
      title: 'Fluid, thumbnail and rounded images',
    },
  ],
  reference: [
    {
      title: 'Image classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-img-fluid', 'max-width: 100%; height: auto, so the image scales down with its container.'],
        ['.os-img-thumbnail', 'Fluid, with padding, a 1px border, rounded corners and a small shadow.'],
        ['.os-rounded-*', 'Any radius utility: sm, md, lg, xl, circle, pill.'],
        ['.os-ratio-* + .os-object-cover', 'Crop to an aspect ratio.'],
        ['.os-figure__caption', 'Muted caption under a figure.'],
      ],
    },
  ],
  a11y: [
    'Every informative image needs alt text; decorative ones take alt="".',
    'Set width and height attributes so the browser reserves space and the page does not shift (WCAG 2.2 is happier with stable layouts).',
  ],
};

export default doc;

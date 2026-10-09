import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'media',
  order: 150,
  name: 'Image, Video, AspectRatio',
  group: 'Layout & media',
  summary: 'Responsive media with modern formats, lazy loading, blur-up fades, captions and fixed ratios.',
  importLine: "import { Image, Video, AspectRatio } from 'onesmallui';",
  examples: [{ name: 'media-basic', title: 'Images and video' }],
  props: [
    {
      title: 'Image',
      props: [
        { name: 'alt', type: 'string', description: 'Required. Use "" for decorative images.' },
        { name: 'sources', type: '{ srcSet, type?, media? }[]', description: 'AVIF/WebP/art-direction sources (renders <picture>).' },
        { name: 'ratio', type: 'number', description: 'Reserve space to avoid layout shift.' },
        { name: 'fit', type: "'cover' | 'contain'", default: "'cover'", description: 'Object fit.' },
        { name: 'caption', type: 'ReactNode', description: 'Wraps in <figure> with <figcaption>.' },
        { name: 'fallback', type: 'ReactNode', description: 'Shown if loading fails.' },
      ],
    },
    {
      title: 'Video',
      props: [
        { name: 'sources', type: '{ src, type? }[]', description: 'WebM, MP4, …' },
        { name: 'tracks', type: '{ src, srcLang, label, kind?, default? }[]', description: 'Captions and descriptions.' },
        { name: 'label', type: 'string', description: 'Accessible name.' },
        { name: 'ratio', type: 'number', default: '16 / 9', description: 'Aspect ratio.' },
      ],
    },
  ],
  a11y: [
    'alt is required by the types, so images can never ship without a decision about alternative text.',
    'Video accepts caption tracks (1.2.2) and audio descriptions (1.2.5 / 1.2.7).',
  ],
};

export default doc;

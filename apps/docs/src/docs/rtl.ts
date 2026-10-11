import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'rtl',
  order: 50,
  name: 'Right-to-left',
  group: 'Framework',
  summary:
    'Layouts mirror for Arabic, Hebrew, Persian and Urdu with no extra stylesheet. Styles use logical properties, placements say start and end, and keyboard navigation follows reading direction.',
  examples: [{ name: 'rtl-basic', title: 'A right-to-left section' }],
  snippets: [
    { title: 'Enable', language: 'markup', code: `<html dir="rtl" lang="ar">` },
    {
      title: 'In your own Sass',
      language: 'scss',
      code: `.chip { margin-inline-start: os.space('2'); }          // not margin-left
.thumb { translate: calc(1rem * var(--os-dir)) 0; }    // --os-dir is 1 or -1`,
    },
  ],
  a11y: ['Always set lang alongside dir so screen readers pick the right voice.'],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'reboot',
  order: 50,
  name: 'Reboot',
  group: 'Content',
  summary: 'The base layer: box-sizing, body type, headings, paragraphs (75ch), links, focus rings, code, lists, tables, forms, fieldsets, summary, address, abbr, sub/sup, iframes and [hidden], made consistent across browsers. It lives in the os.reset layer, so anything you write overrides it.',
  examples: [
    {
      name: 'reboot-basic',
      title: 'Element defaults',
    },
  ],
  reference: [
    {
      title: 'What Reboot sets',
      columns: ['Elements', 'Defaults'],
      rows: [
        ['*, ::before, ::after', 'box-sizing: border-box.'],
        ['body', 'Theme font, fluid base size, 1.6 line height, text and background tokens.'],
        ['h1–h6, p', 'Tight heading line height and bottom margins; paragraphs capped at 75ch.'],
        ['a, :focus-visible', 'Underlined links; a 3px focus outline everywhere.'],
        [
          'ul, ol, dl, address, blockquote, figure, pre, table',
          'Margins only on the block end; 1.5rem list indent.',
        ],
        [
          'dt, dd, b, strong, small, sub, sup, abbr[title]',
          'Bold terms, flush descriptions, bolder, 0.875em, non-shifting sub/sup, dotted abbr.',
        ],
        ['table, th, caption', 'Collapsed borders, inherited th alignment, start-aligned caption.'],
        [
          'button, input, select, textarea',
          'Inherit font and color; pointer cursor on enabled buttons; vertical textarea resize.',
        ],
        ['fieldset, legend', 'No border, padding or margin; legend wraps.'],
        [
          'summary, output, iframe, progress, [hidden]',
          'List-item summary, inline-block output, borderless iframe, baseline progress, hidden really hides.',
        ],
      ],
    },
  ],
  a11y: [
    'Focus is always visible: a 3px outline with offset on :focus-visible (WCAG 2.4.7 and 2.4.13).',
    'Text sizes use rem with fluid clamp() and never drop below 16px for body text, so zooming to 200% works (1.4.4).',
    'Reduced motion turns off smooth scrolling.',
  ],
};

export default doc;

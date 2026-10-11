import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'typography',
  order: 10,
  name: 'Typography',
  group: 'Content',
  summary: 'Headings, display sizes, lead text, inline text elements, abbreviations, blockquotes, lists and description lists. Sizes are fluid (clamp), so type scales with the viewport without breakpoints.',
  importLine: "import { Blockquote } from 'onesmallui';",
  examples: [
    {
      name: 'typography-headings',
      title: 'Headings',
      description: 'h1–h6 come styled; .os-h1 … .os-h6 match them on any element.',
    },
    {
      name: 'typography-display',
      title: 'Display headings and lead',
    },
    {
      name: 'typography-inline',
      title: 'Inline text elements and abbreviations',
    },
    {
      name: 'typography-blockquote',
      title: 'Blockquotes, sources, alignment and nesting',
    },
    {
      name: 'typography-lists',
      title: 'Lists and description lists',
    },
  ],
  reference: [
    {
      title: 'Typography classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-h1 … .os-h6', 'Heading size, weight and spacing without changing the element.'],
        [
          '.os-display-1 … .os-display-6',
          'Large fluid display type in the display font ($display-sizes).',
        ],
        ['.os-lead', 'Larger intro paragraph.'],
        [
          '.os-text-xs … .os-text-5xl',
          'Global fluid font-size scale (tokens --os-text-*). Responsive: md:os-text-2xl.',
        ],
        [
          'mark, .os-mark',
          'Highlight on the warning color with its AAA on-color; system Mark colors in forced-colors mode.',
        ],
        ['small, .os-small', '0.875em fine print.'],
        [
          'del, s, ins, u',
          'Line-through and underline (ins uses a double underline so it is not mistaken for a link).',
        ],
        [
          'abbr[title], .os-initialism',
          'Dotted underline and help cursor; initialism is slightly smaller and uppercase.',
        ],
        [
          '.os-blockquote',
          'Quote with a leading rule; data-variant="plain" removes it. Nested quotes indent again.',
        ],
        [
          '.os-blockquote-footer',
          'Source line for a figcaption, prefixed with an em dash hidden from screen readers.',
        ],
        ['.os-list-unstyled', 'No bullets or indent on direct children.'],
        ['.os-list-inline, .os-list-inline-item', 'Horizontal, wrapping list.'],
        ['.os-dl-horizontal', 'Terms beside descriptions from sm up (stacked below).'],
      ],
    },
  ],
  props: [
    {
      title: 'Blockquote',
      props: [
        { name: 'source', type: 'ReactNode', description: 'Who said it. Wraps the quote in <figure> with a <figcaption>.' },
        { name: 'sourceTitle', type: 'ReactNode', description: 'The work, rendered in <cite>.' },
        { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Text alignment; center and end drop the rule.' },
        { name: 'variant', type: "'default' | 'plain'", description: "'plain' removes the leading rule." },
        { name: 'cite', type: 'string', description: 'URL of the source (native attribute).' },
      ],
    },
  ],
  a11y: [
    'Pick heading levels for the document outline, then use .os-h* classes to adjust the look; never skip levels for styling.',
    'Body text keeps a 75ch maximum line length (WCAG 1.4.8) and every text color meets 7:1.',
    'Screen readers do not announce del, ins or mark by default. When the change matters, add visually hidden text such as <span class="os-visually-hidden">deleted: </span>.',
    'abbr title text is not reliably exposed; spell the term out on first use.',
    'Removing bullets with .os-list-unstyled or .os-list-inline makes Safari drop list semantics; add role="list" to keep them.',
    'Blockquote marks the source up as figure › figcaption › cite, so the quote and its attribution are associated.',
  ],
};

export default doc;

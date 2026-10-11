import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'prose',
  order: 40,
  name: 'Prose',
  group: 'Content',
  summary: 'One class for long-form HTML you do not control: Markdown, MDX or CMS output. Headings, inline text, code, lists, quotes, figures, tables and rules get a consistent reading rhythm.',
  examples: [
    {
      name: 'prose-basic',
      title: 'Article',
    },
  ],
  reference: [
    {
      title: 'Prose',
      columns: ['Selector', 'Effect'],
      rows: [
        [
          '.os-prose',
          'Styles descendant elements with :where(), so utilities and your classes still win.',
        ],
        ['.os-prose[data-size="sm" | "lg"]', 'Scales the whole article.'],
        ['.os-not-prose', 'Opt a subtree out (embedded widgets, components).'],
        ['$prose-max-width', 'Line length cap, 70ch by default.'],
      ],
    },
  ],
  a11y: [
    'Lines are capped at 70ch (WCAG 1.4.8 asks for 80 characters or fewer) and line height is 1.75 (1.4.8 asks for at least 1.5).',
    'All prose colors are text tokens at 7:1 or better; links stay underlined so they do not rely on color.',
    'Prose cannot fix structure: keep heading levels in order and give tables captions and header scopes in your source content.',
  ],
};

export default doc;

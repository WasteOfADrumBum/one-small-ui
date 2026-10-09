import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'code',
  order: 180,
  name: 'CodeBlock',
  group: 'Data display',
  summary: 'Code panels with a one-click copy button. Plug in any syntax highlighter.',
  importLine: "import { CodeBlock } from 'onesmallui';",
  examples: [{ name: 'code-basic', title: 'Copyable code' }],
  props: [
    {
      title: 'CodeBlock',
      props: [
        { name: 'code', type: 'string', description: 'Source text.' },
        { name: 'language', type: 'string', description: 'Label and data-language.' },
        { name: 'title', type: 'ReactNode', description: 'Header text, e.g. a file name.' },
        { name: 'renderCode', type: '(code, language) => ReactNode', description: 'Hook in Prism, Shiki, etc.' },
        { name: 'noCopy', type: 'boolean', description: 'Hide the copy button.' },
      ],
    },
  ],
  a11y: ['The scrollable <pre> is keyboard focusable.', 'Copy success is announced to screen readers.'],
};

export default doc;

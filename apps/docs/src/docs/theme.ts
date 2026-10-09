import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'theme',
  order: 190,
  name: 'ThemeProvider & ThemeToggle',
  group: 'Theming',
  summary: 'Light, dark and system themes, remembered between visits.',
  importLine: "import { ThemeProvider, ThemeToggle, useTheme } from 'onesmallui';",
  examples: [{ name: 'theme-basic', title: 'Switching themes' }],
  props: [
    {
      title: 'ThemeProvider',
      props: [
        { name: 'defaultMode', type: "'light' | 'dark' | 'system'", default: "'system'", description: 'Initial mode.' },
        { name: 'mode / onModeChange', type: 'ThemeMode', description: 'Controlled mode.' },
        { name: 'storageKey', type: 'string | false', default: "'onesmallui-theme'", description: 'localStorage key, or false.' },
      ],
    },
    {
      title: 'useTheme()',
      props: [
        { name: 'mode', type: 'ThemeMode', description: 'What the user picked.' },
        { name: 'resolvedTheme', type: "'light' | 'dark'", description: 'What is showing.' },
        { name: 'setMode / toggle', type: 'function', description: 'Change it.' },
      ],
    },
  ],
  a11y: ['Both themes pass AAA contrast for every token pair.', 'The toggle announces the theme it will switch to.'],
};

export default doc;

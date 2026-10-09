import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'theme',
  order: 190,
  name: 'ThemeProvider & ThemeToggle',
  group: 'Theming',
  summary:
    'Light, dark and system color modes, remembered between visits. Themes apply globally or per component, and every token is a CSS variable you can change at runtime.',
  importLine: "import { ThemeProvider, ThemeToggle, useTheme } from 'onesmallui';",
  examples: [
    { name: 'theme-basic', title: 'Light, dark and system modes' },
    { name: 'theme-scoped', title: 'Per-component themes', description: 'Put data-os-theme="light" or "dark" on any element.' },
    { name: 'theme-runtime', title: 'Runtime customization with CSS variables' },
  ],
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
  snippets: [
    {
      title: 'Without React',
      language: 'markup',
      code: `<html data-os-theme="dark">        <!-- force dark; omit to follow the OS -->
<section data-os-theme="light">...</section> <!-- a light island -->`,
    },
  ],
  a11y: ['Both themes pass AAA contrast for every token pair.', 'The toggle announces the theme it will switch to.'],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const v = '0.2.0';

const doc: ComponentDoc = {
  slug: 'installation',
  order: 10,
  name: 'Installation',
  group: 'Framework',
  summary:
    'Install from npm with any package manager, or load the CSS and the no-build JavaScript straight from a CDN. Works with Vite, Webpack, Parcel, Next.js and plain HTML.',
  examples: [],
  snippets: [
    { title: 'Package managers', language: 'bash', code: 'npm install onesmallui\npnpm add onesmallui\nyarn add onesmallui\nbun add onesmallui' },
    {
      title: 'CDN: CSS and data-attribute JavaScript',
      language: 'markup',
      description:
        'No build step. The CSS gives you every class; the DOM script wires up data-os-* attributes (collapse, dialogs, drawers, menus, tabs, tooltips, popovers, toasts, togglers, scrollspy, carousels) without React.',
      code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/onesmallui@${v}/dist/onesmallui.min.css" />
<script type="module">
  import { init } from 'https://cdn.jsdelivr.net/npm/onesmallui@${v}/dist/dom.js';
  init();
</script>

<!-- Or a classic script that exposes window.OneSmallUI and initializes itself -->
<script src="https://cdn.jsdelivr.net/npm/onesmallui@${v}/dist/onesmallui-dom.iife.js" defer></script>`,
    },
    {
      title: 'CDN: React components as ES modules',
      language: 'markup',
      code: `<script type="importmap">
{ "imports": {
  "react": "https://esm.sh/react@19",
  "react-dom/client": "https://esm.sh/react-dom@19/client",
  "onesmallui": "https://esm.sh/onesmallui@${v}?external=react,react-dom"
} }
</script>`,
    },
    {
      title: 'Vite',
      language: 'tsx',
      description: 'Nothing to configure. Import the CSS (or SCSS) once in your entry file.',
      code: `// main.tsx
import 'onesmallui/styles.css'; // or: import './styles.scss' with @use 'onesmallui/scss'
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'onesmallui';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);`,
    },
    {
      title: 'Webpack',
      language: 'javascript',
      description: 'Use css-loader for the compiled CSS, or sass-loader to compile the SCSS with your own variables.',
      code: `// webpack.config.js
module.exports = {
  module: {
    rules: [
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
    ],
  },
};`,
    },
    {
      title: 'Parcel',
      language: 'markup',
      description: 'Parcel resolves package exports and compiles SCSS out of the box.',
      code: `<!-- index.html -->
<link rel="stylesheet" href="./styles.scss" />
<script type="module" src="./main.tsx"></script>

/* styles.scss */
@use 'onesmallui/scss' with ($radius-base: 8px);`,
    },
    {
      title: 'Next.js',
      language: 'tsx',
      description: "Every module ships with 'use client', so components import straight into App Router files.",
      code: `// app/layout.tsx
import 'onesmallui/styles.css';
import { ThemeProvider, themeInitScript } from 'onesmallui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}`,
    },
    {
      title: 'What ships',
      language: 'bash',
      code: `onesmallui                ESM React components + TypeScript declarations (dist/index.js, dist/index.d.ts)
onesmallui/dom            Vanilla data-attribute controls, methods and events (no React)
onesmallui/styles.css     Compiled CSS (also styles.min.css)
onesmallui/scss           Sass entry: modules, maps, mixins, functions
onesmallui/tokens.json    Color tokens for both themes
onesmallui/agent/SKILL.md Usage guide for AI coding agents`,
    },
  ],
  a11y: [],
};

export default doc;

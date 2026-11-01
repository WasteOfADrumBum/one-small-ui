import type { ComponentDoc } from '../site/docTypes';

const v = __OS_VERSION__;

const doc: ComponentDoc = {
  slug: 'installation',
  order: 10,
  name: 'Installation',
  group: 'Framework',
  summary:
    'Install from npm with any package manager, or load the CSS and the no-build JavaScript straight from a CDN. Works with Vite, Webpack, Parcel, Next.js and plain HTML.',
  examples: [],
  snippets: [
    { title: 'Package managers', language: 'bash', code: 'npm install @onesmall/ui\npnpm add @onesmall/ui\nyarn add @onesmall/ui\nbun add @onesmall/ui' },
    {
      title: 'CDN: CSS and data-attribute JavaScript',
      language: 'markup',
      description:
        'No build step. The CSS gives you every class; the DOM script wires up data-os-* attributes (collapse, dialogs, drawers, menus, tabs, tooltips, popovers, toasts, togglers, scrollspy, carousels) without React.',
      code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@onesmall/ui@${v}/dist/onesmallui.min.css" />
<script type="module">
  import { init } from 'https://cdn.jsdelivr.net/npm/@onesmall/ui@${v}/dist/dom.js';
  init();
</script>

<!-- Or a classic script that exposes window.OneSmallUI and initializes itself -->
<script src="https://cdn.jsdelivr.net/npm/@onesmall/ui@${v}/dist/onesmallui-dom.iife.js" defer></script>`,
    },
    {
      title: 'CDN: React components as ES modules',
      language: 'markup',
      code: `<script type="importmap">
{ "imports": {
  "react": "https://esm.sh/react@19",
  "react-dom/client": "https://esm.sh/react-dom@19/client",
  "@onesmall/ui": "https://esm.sh/@onesmall/ui@${v}?external=react,react-dom"
} }
</script>`,
    },
    {
      title: 'Vite',
      language: 'tsx',
      description: 'Nothing to configure. Import the CSS (or SCSS) once in your entry file.',
      code: `// main.tsx
import '@onesmall/ui/styles.css'; // or: import './styles.scss' with @use '@onesmall/ui/scss'
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@onesmall/ui';
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
@use '@onesmall/ui/scss' with ($radius-base: 8px);`,
    },
    {
      title: 'Next.js',
      language: 'tsx',
      description: "Every module ships with 'use client', so components import straight into App Router files.",
      code: `// app/layout.tsx
import '@onesmall/ui/styles.css';
import { ThemeProvider, themeInitScript } from '@onesmall/ui';

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
      code: `@onesmall/ui                ESM + CJS React components, bundled TypeScript declarations
@onesmall/ui/icons          Tree-shakable icon components (also exported from the root)
@onesmall/ui/dom            Vanilla data-attribute controls, methods and events (no React)
@onesmall/ui/styles.css     Compiled CSS (also styles.min.css)
@onesmall/ui/scss           Sass entry: modules, maps, mixins, functions
@onesmall/ui/tokens.json    Color tokens for both themes, plus motion tokens (durations, easings)
@onesmall/ui/agent/SKILL.md Usage guide for AI coding agents`,
    },
    {
      title: 'Compatibility',
      language: 'bash',
      description:
        'Checked in CI by installing the packed package into clean React 18 and React 19 apps on Node 18, 20, 22 and 24: ESM and CommonJS imports, strict TypeScript (bundler and node16 resolution), server rendering without warnings and hydration without mismatches.',
      code: `React        18 and 19 (peer: ^18 || ^19)
Node         18.18+ for your app (SSR, tests, builds)
TypeScript   5.x, moduleResolution bundler | node16 | nodenext
Browsers     current Chrome, Edge, Firefox, Safari`,
    },
    {
      title: 'Upgrade, roll back, uninstall',
      language: 'bash',
      description:
        'Read the changelog before upgrading; deprecated APIs warn once in development and are removed only in a major release. To uninstall, also remove the CSS or SCSS import, themeInitScript() and the provider wrappers. Only the theme choice (and, if you opt in, CommandPalette recents and Sidebar collapsed state) is kept in localStorage.',
      code: `npm install @onesmall/ui@latest               # upgrade
npm install @onesmall/ui@0.5.0 --save-exact   # roll back to a known version
npm uninstall @onesmall/ui                    # remove`,
    },
  ],
  a11y: [],
};

export default doc;

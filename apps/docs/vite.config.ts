import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const lib = (p: string) => fileURLToPath(new URL(`../../packages/onesmallui/${p}`, import.meta.url));

const { version } = JSON.parse(readFileSync(lib('package.json'), 'utf8')) as { version: string };

// The docs run against the library source, so edits to components and SCSS hot-reload.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Single source for the version shown in the docs: the library's package.json.
  define: { __OS_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: [
      { find: /^@onesmall\/ui\/scss$/, replacement: lib('scss/index.scss') },
      { find: /^@onesmall\/ui\/scss\/(.*)$/, replacement: lib('scss/$1') },
      { find: /^@onesmall\/ui\/dom$/, replacement: lib('src/dom/index.ts') },
      { find: /^@onesmall\/ui$/, replacement: lib('src/index.ts') },
    ],
  },
});

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const lib = (p: string) => fileURLToPath(new URL(`../../packages/onesmallui/${p}`, import.meta.url));

// The docs run against the library source, so edits to components and SCSS hot-reload.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^onesmallui\/scss$/, replacement: lib('scss/index.scss') },
      { find: /^onesmallui\/scss\/(.*)$/, replacement: lib('scss/$1') },
      { find: /^onesmallui\/dom$/, replacement: lib('src/dom/index.ts') },
      { find: /^onesmallui$/, replacement: lib('src/index.ts') },
    ],
  },
});

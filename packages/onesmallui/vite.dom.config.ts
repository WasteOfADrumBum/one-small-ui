import { defineConfig } from 'vite';

// The no-React layer as standalone bundles for CDNs, <script> tags and require():
//   dist/dom.js                    ES module (import { init } from '.../dom.js')
//   dist/dom.cjs                   CommonJS
//   dist/onesmallui-dom.iife.js    classic script, auto-initialises, global `OneSmallUI` (vite.dom-iife.config.ts)
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    lib: {
      entry: { dom: 'src/dom/index.ts' },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
  },
});

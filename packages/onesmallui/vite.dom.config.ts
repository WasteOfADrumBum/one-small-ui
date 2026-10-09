import { defineConfig } from 'vite';

// The no-React layer as standalone bundles for CDNs and <script> tags:
//   dist/dom.js                    ES module (import { init } from '.../dom.js')
//   dist/onesmallui-dom.iife.js    classic script, auto-initialises, global `OneSmallUI`
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: { dom: 'src/dom/index.ts' },
      output: { format: 'es', entryFileNames: '[name].js' },
      preserveEntrySignatures: 'exports-only',
    },
  },
});

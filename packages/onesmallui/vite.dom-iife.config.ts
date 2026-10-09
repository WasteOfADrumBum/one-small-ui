import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: { entry: 'src/dom/auto.ts', name: 'OneSmallUI', formats: ['iife'], fileName: () => 'onesmallui-dom.iife.js' },
  },
});

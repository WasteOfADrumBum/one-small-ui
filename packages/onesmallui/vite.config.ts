import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build: ES modules (.js) and CommonJS (.cjs), one file per source module
// so consumers tree-shake unused components. React stays a peer dependency.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    lib: {
      // Two public entry points: the package root and the tree-shakable `@onesmall/ui/icons`.
      entry: { index: 'src/index.ts', icons: 'src/icons/index.ts' },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Components use hooks and browser APIs, so mark them as client components
        // for React Server Components frameworks (Next.js App Router, etc.).
        banner: "'use client';",
      },
    },
  },
});

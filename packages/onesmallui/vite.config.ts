import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build: ES modules, one file per source module so consumers tree-shake
// unused components. React stays a peer dependency.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        // Components use hooks and browser APIs, so mark them as client components
        // for React Server Components frameworks (Next.js App Router, etc.).
        banner: "'use client';",
      },
    },
  },
});

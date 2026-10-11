import { dts } from 'rollup-plugin-dts';

// Bundles the per-file declarations tsc emits into dist/types into one file per
// entry point, plus .d.cts twins so `require` consumers resolve types too.
const entries = { index: 'dist/types/index.d.ts', dom: 'dist/types/dom/index.d.ts' };

export default Object.entries(entries).flatMap(([name, input]) =>
  ['d.ts', 'd.cts'].map((ext) => ({
    input,
    output: { file: `dist/${name}.${ext}`, format: 'es' },
    plugins: [dts()],
  })),
);

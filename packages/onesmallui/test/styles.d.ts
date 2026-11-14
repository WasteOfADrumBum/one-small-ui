// TypeScript 7 checks side-effect imports by default (noUncheckedSideEffectImports), so the layout fixture's SCSS
// import needs a module declaration. Vite compiles the file; this only tells the type checker it exists.
declare module '*.scss';

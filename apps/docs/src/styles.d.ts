// TypeScript 7 checks side-effect imports by default (noUncheckedSideEffectImports). The package's `./scss` export
// is a Sass entry that Vite compiles, so tell the type checker it is a valid module.
declare module '@onesmall/ui/scss';

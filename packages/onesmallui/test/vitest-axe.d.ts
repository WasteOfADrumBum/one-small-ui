// Adds jest-axe's matcher to Vitest's expect (registered in setup.ts).
declare module 'vitest' {
  interface Matchers<T> {
    toHaveNoViolations(): T;
  }
}

export {};

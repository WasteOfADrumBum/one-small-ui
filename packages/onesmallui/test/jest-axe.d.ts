// Minimal types for jest-axe as used with Vitest (@types/jest-axe pulls in Jest's globals).
declare module 'jest-axe' {
  import type { AxeResults, RunOptions, Spec } from 'axe-core';

  export interface JestAxeConfigureOptions extends RunOptions {
    globalOptions?: Spec;
    impactLevels?: Array<'minor' | 'moderate' | 'serious' | 'critical'>;
  }

  export type JestAxe = (html: Element | string, options?: RunOptions) => Promise<AxeResults>;

  export function configureAxe(options?: JestAxeConfigureOptions): JestAxe;
  export const axe: JestAxe;
  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message(): string; actual: unknown };
  };
}

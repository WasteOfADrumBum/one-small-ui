import { useMediaQuery } from './useMediaQuery';

/** `true` when the user has asked the OS to reduce motion (`prefers-reduced-motion: reduce`). `false` on the server. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

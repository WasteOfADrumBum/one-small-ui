import { useSyncExternalStore } from 'react';

/** Subscribes to a CSS media query. Returns `false` during server rendering. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

/** Breakpoints matching the SCSS `$breakpoints` map. */
export const breakpoints = { sm: 576, md: 768, lg: 1024, xl: 1280, '2xl': 1536, '3xl': 1920 } as const;
export type Breakpoint = keyof typeof breakpoints;

/** `true` when the viewport is at least the given breakpoint wide. */
export function useBreakpoint(bp: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[bp]}px)`);
}

/** `true` when the user has asked the OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

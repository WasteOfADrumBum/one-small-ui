import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server. React 18 warns for every
 * `useLayoutEffect` it meets while server rendering; React 19 does not. Internal: not exported from
 * the barrel. Use it instead of `useLayoutEffect` anywhere a component can render on the server.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

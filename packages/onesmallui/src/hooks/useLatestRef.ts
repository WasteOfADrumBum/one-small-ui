import { useEffect, useLayoutEffect, useRef } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * A ref that holds the latest `value`, for reading in event handlers and effects
 * without re-subscribing. Updated after commit rather than during render, so a
 * render React throws away never leaks into it. Internal (not exported).
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

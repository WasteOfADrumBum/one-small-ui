import { useCallback, type MutableRefObject, type Ref } from 'react';

/** Assigns `el` to a callback or object ref. Internal (not exported). */
export function assignRef<T>(ref: Ref<T> | undefined, el: T | null) {
  if (typeof ref === 'function') ref(el);
  else if (ref) (ref as MutableRefObject<T | null>).current = el;
}

/**
 * One stable callback ref that feeds two refs (e.g. an internal ref and the
 * consumer's). Internal (not exported).
 */
export function useMergedRefs<T>(a: Ref<T> | undefined, b: Ref<T> | undefined) {
  return useCallback(
    (el: T | null) => {
      assignRef(a, el);
      assignRef(b, el);
    },
    [a, b],
  );
}

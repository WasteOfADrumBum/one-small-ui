import { useCallback, useState } from 'react';
import { useLatestRef } from './useLatestRef';

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`),
 * the same pattern native inputs use.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;
  const onChangeRef = useLatestRef(onChange);

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled, onChangeRef],
  );
  return [current, setValue];
}

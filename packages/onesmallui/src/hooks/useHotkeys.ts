import { useEffect, useMemo, type RefObject } from 'react';
import { isApplePlatform, isEditableTarget, matchesHotkey, parseHotkey } from '../utils/hotkeys';
import { useLatestRef } from './useLatestRef';

export interface UseHotkeysOptions {
  /** Listen while true. Default `true`. */
  enabled?: boolean;
  /** Call `preventDefault()` on a match (stops the browser's own Ctrl+K, Ctrl+P…). Default `true`. */
  preventDefault?: boolean;
  /** Also fire while typing in inputs, textareas, selects and contenteditable. Default `false`. */
  allowInInputs?: boolean;
  /** Element to listen on. Defaults to `document`. */
  target?: RefObject<HTMLElement | null>;
  /** `'keydown'` (default) or `'keyup'`. */
  event?: 'keydown' | 'keyup';
}

/**
 * Runs `handler` when a key combo is pressed: `useHotkeys('Mod+K', open)`. `Mod` is ⌘
 * on Apple platforms and Ctrl elsewhere. Pass an array for several combos. Events from
 * text fields are ignored unless `allowInInputs`, and IME composition never triggers it.
 * The listener is added in an effect (SSR safe) and removed on unmount.
 */
export function useHotkeys(
  combo: string | string[],
  handler: (event: KeyboardEvent) => void,
  { enabled = true, preventDefault = true, allowInInputs = false, target, event = 'keydown' }: UseHotkeysOptions = {},
) {
  const handlerRef = useLatestRef(handler);
  const key = Array.isArray(combo) ? combo.join('\n') : combo;
  const parsed = useMemo(() => key.split('\n').filter(Boolean).map(parseHotkey), [key]);

  useEffect(() => {
    if (!enabled || parsed.length === 0) return;
    const el: HTMLElement | Document = target?.current ?? document;
    const platform = isApplePlatform() ? 'mac' : 'other';
    const onKey = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.isComposing || ke.keyCode === 229) return;
      if (!allowInInputs && isEditableTarget(ke.target)) return;
      if (!parsed.some((hk) => matchesHotkey(ke, hk, platform))) return;
      if (preventDefault) ke.preventDefault();
      handlerRef.current(ke);
    };
    el.addEventListener(event, onKey);
    return () => el.removeEventListener(event, onKey);
  }, [enabled, parsed, preventDefault, allowInInputs, target, event, handlerRef]);
}

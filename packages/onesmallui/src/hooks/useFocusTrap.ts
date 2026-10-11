import { useEffect, type RefObject } from 'react';
import { getFocusableElements } from '../utils/focusable';
import { useFocusReturn } from './useFocusReturn';
import { useLatestRef } from './useLatestRef';

export interface UseFocusTrapOptions {
  /** Trap while true. Default `true`. */
  active?: boolean;
  /**
   * Where focus goes when the trap activates: an element ref, `'first'` (default: the
   * first `[autofocus]` or tabbable element, else the container), `'container'`,
   * or `false` to leave focus alone. Nothing moves if focus is already inside.
   */
  initialFocus?: RefObject<HTMLElement | null> | 'first' | 'container' | false;
  /** Return focus on deactivate: to the previously focused element (`true`, default), an element ref, or nowhere (`false`). */
  returnFocus?: boolean | RefObject<HTMLElement | null>;
}

// Nested traps: only the most recently activated one handles Tab.
const stack: object[] = [];

function focusContainer(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus();
}

/**
 * Keeps Tab and Shift+Tab inside `ref` while active, wrapping at both ends.
 * Focusables are looked up on every key press, so content added later is
 * included; disabled, hidden and inert elements are skipped. With nested traps
 * the innermost (latest) one wins. SSR safe.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  { active = true, initialFocus = 'first', returnFocus = true }: UseFocusTrapOptions = {},
) {
  const initialRef = useLatestRef(initialFocus);
  useFocusReturn({
    active,
    target: typeof returnFocus === 'object' ? returnFocus : undefined,
    container: ref,
    restoreOnDeactivate: returnFocus !== false,
  });

  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;
    const token = {};
    stack.push(token);

    const initial = initialRef.current;
    if (initial !== false && !container.contains(document.activeElement)) {
      if (typeof initial === 'object' && initial.current) initial.current.focus();
      else if (initial === 'container') focusContainer(container);
      else {
        const auto = container.querySelector<HTMLElement>('[autofocus]');
        const first = auto ?? getFocusableElements(container)[0];
        if (first) first.focus();
        else focusContainer(container);
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.defaultPrevented || stack[stack.length - 1] !== token) return;
      const items = getFocusableElements(container);
      const current = document.activeElement as HTMLElement | null;
      if (!items.length) {
        e.preventDefault();
        focusContainer(container);
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const inside = !!current && container.contains(current);
      if (e.shiftKey && (!inside || current === first || current === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const i = stack.indexOf(token);
      if (i !== -1) stack.splice(i, 1);
    };
  }, [active, ref, initialRef]);
}

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useLatestRef } from './useLatestRef';

export interface UseFocusReturnOptions {
  /** Saves the focused element when this becomes true; restores it when it becomes false. */
  active: boolean;
  /** Return focus here instead of the element that was focused on activation. */
  target?: RefObject<HTMLElement | null>;
  /** Used when the element to return to was removed from the page. */
  fallback?: RefObject<HTMLElement | null>;
  /**
   * The overlay or region that is closing. Focus is only moved back when it was lost
   * (on `<body>`) or is still inside this container, so focus the user moved
   * elsewhere is never stolen.
   */
  container?: RefObject<HTMLElement | null>;
  /** Restore automatically on deactivate (default). `false`: call `restore()` yourself. */
  restoreOnDeactivate?: boolean;
}

/**
 * Remembers which element had focus when `active` turns on and moves focus back
 * to it when `active` turns off (WCAG 2.4.3 Focus Order). If that element is gone,
 * falls back to `fallback`, else leaves focus alone. SSR safe.
 */
export function useFocusReturn({ active, target, fallback, container, restoreOnDeactivate = true }: UseFocusReturnOptions) {
  const saved = useRef<HTMLElement | null>(null);
  const opts = useLatestRef({ target, fallback, container, restoreOnDeactivate });

  /** Moves focus back now. Returns true when an element received focus. */
  const restore = useCallback(() => {
    const { target: t, fallback: f } = opts.current;
    const candidates = [t?.current, saved.current, f?.current];
    const el = candidates.find((c): c is HTMLElement => !!c && c.isConnected && c !== document.body);
    if (!el) return false;
    el.focus({ preventScroll: true });
    return document.activeElement === el;
  }, [opts]);

  useEffect(() => {
    if (!active) return;
    saved.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const options = opts.current;
    return () => {
      if (!options.restoreOnDeactivate) return;
      // Deferred, so an overlay closing in the same commit is closed (and no longer
      // makes the page inert) before focus moves back.
      queueMicrotask(() => {
        const active = document.activeElement;
        const box = options.container?.current;
        const lost = !active || active === document.body || (!!box && box.contains(active));
        if (lost) restore();
      });
    };
  }, [active, opts, restore]);

  return { restore };
}

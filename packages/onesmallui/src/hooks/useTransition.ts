import { useEffect, useRef, useState } from 'react';
import { motion } from '../tokens';
import { useLatestRef } from './useLatestRef';
import { useReducedMotion } from './useReducedMotion';

/**
 * The library-wide transition vocabulary, also used as `data-state` by Transition,
 * Dialog, Drawer, Popover, Tooltip, Toast and Collapse.
 * `opening` → `open` → `closing` → `closed`.
 */
export type TransitionState = 'opening' | 'open' | 'closing' | 'closed';

export interface UseTransitionOptions {
  /** Animate in on first mount when `show` starts true. */
  appear?: boolean;
  /** Length of each phase in ms. Defaults to the `base` motion token (200ms). `0` switches instantly. */
  duration?: number;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
}

const motionOff = () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-os-motion') === 'off';

/**
 * The engine behind `<Transition>`: turns a boolean into
 * `opening | open | closing | closed`, timed by `duration`. Under
 * `prefers-reduced-motion` (or `data-os-motion="off"` on `<html>`) the duration
 * drops to 0, and every callback still fires. Toggling mid-phase reverses at once.
 */
export function useTransition(show: boolean, options: UseTransitionOptions = {}) {
  const { appear = false, duration = motion.duration.base } = options;
  const reduced = useReducedMotion();
  const ms = reduced ? 0 : duration;
  const [state, setState] = useState<TransitionState>(show ? (appear && ms > 0 ? 'opening' : 'open') : 'closed');
  const [prevShow, setPrevShow] = useState(show);
  if (show !== prevShow) {
    setPrevShow(show);
    setState(ms > 0 ? (show ? 'opening' : 'closing') : show ? 'open' : 'closed');
  }
  const callbacks = useLatestRef(options);
  const previous = useRef<TransitionState | null>(null);

  useEffect(() => {
    const cb = callbacks.current;
    const prev = previous.current;
    previous.current = state;
    const wait = motionOff() ? 0 : ms;
    if (state === 'opening') {
      cb.onEnter?.();
      const t = setTimeout(() => setState((s) => (s === 'opening' ? 'open' : s)), wait);
      return () => clearTimeout(t);
    }
    if (state === 'closing') {
      cb.onExit?.();
      const t = setTimeout(() => setState((s) => (s === 'closing' ? 'closed' : s)), wait);
      return () => clearTimeout(t);
    }
    // First render (no `appear`): nothing happened yet.
    if (prev === null) {
      if (state === 'open' && appear) {
        cb.onEnter?.();
        cb.onEntered?.();
      }
      return;
    }
    if (state === 'open') {
      if (prev !== 'opening') cb.onEnter?.();
      cb.onEntered?.();
    } else if (state === 'closed') {
      if (prev !== 'closing') cb.onExit?.();
      cb.onExited?.();
    }
    // `ms` only matters when a phase starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { state, mounted: state !== 'closed', duration: ms };
}

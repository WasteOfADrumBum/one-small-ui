import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Placement } from '../components/types';
import { autoPosition, type AnchorLike, type PositionOptions } from '../utils/position';
import { useResponsiveValue, type ResponsiveValue } from './useResponsiveValue';

export interface UseFloatingOptions extends Omit<PositionOptions, 'placement' | 'arrow'> {
  open: boolean;
  /** Preferred side, optionally per breakpoint: `{ base: 'bottom', md: 'right-start' }`. */
  placement?: ResponsiveValue<Placement>;
}

/**
 * Keeps a floating element positioned next to its anchor while `open`.
 * Attach `anchorRef` to the trigger (or call `setAnchor` with a virtual anchor),
 * `floatingRef` to the panel, and optionally `arrowRef`. The panel needs
 * `position: fixed` (the `.os-floating` class provides it).
 */
export function useFloating<A extends Element = HTMLElement, F extends HTMLElement = HTMLElement>({
  open,
  placement = 'bottom',
  ...options
}: UseFloatingOptions) {
  const resolved = useResponsiveValue(placement);
  const anchorRef = useRef<A | null>(null);
  const floatingRef = useRef<F | null>(null);
  const arrowRef = useRef<HTMLElement | null>(null);
  const virtual = useRef<AnchorLike | null>(null);
  const [tick, force] = useState(0);
  const { offset, flip, shift, padding, matchWidth } = options;

  const setAnchor = useCallback((anchor: AnchorLike | null) => {
    virtual.current = anchor;
    force((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    const anchor = virtual.current ?? anchorRef.current;
    const floating = floatingRef.current;
    if (!open || !anchor || !floating) return;
    return autoPosition(anchor, floating, {
      placement: resolved,
      offset,
      flip,
      shift,
      padding,
      matchWidth,
      arrow: arrowRef.current,
    });
  }, [open, resolved, offset, flip, shift, padding, matchWidth, tick]);

  return { anchorRef, floatingRef, arrowRef, setAnchor, placement: resolved };
}

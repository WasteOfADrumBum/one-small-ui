import { useEffect, type RefObject } from 'react';
import { useLatestRef } from './useLatestRef';

/**
 * Which way the pointer moved, in logical terms: `start` is toward the inline start
 * (left in LTR, right in RTL), `end` toward the inline end. Callers never flip for RTL.
 */
export type SwipeDirection = 'start' | 'end' | 'up' | 'down';

export interface SwipeInfo {
  /** Distance along the swipe's axis, in CSS pixels (always positive). */
  distance: number;
  /** Physical movement: `clientX` and `clientY` change from press to release. */
  deltaX: number;
  deltaY: number;
  pointerType: string;
  /** The `pointerup` that ended the swipe. */
  event: PointerEvent;
}

export interface UseSwipeOptions {
  /** Called once per swipe, when the pointer lifts past `threshold`. */
  onSwipe: (direction: SwipeDirection, info: SwipeInfo) => void;
  /** Minimum travel in px. Default 40. */
  threshold?: number;
  /** Listen while true. Default `true`. */
  enabled?: boolean;
  /**
   * `'x'` (default) measures only horizontal travel (`start` / `end`), `'y'` only vertical
   * (`up` / `down`), `'both'` reports whichever axis moved further.
   */
  axis?: 'x' | 'y' | 'both';
  /** Also count mouse drags. Off by default: mouse users have buttons. */
  mouse?: boolean;
}

/** Whether `el` lays out right to left (`dir="rtl"` above it, or `direction: rtl`). */
function isRtl(el: Element) {
  return el.closest('[dir]')?.getAttribute('dir') === 'rtl' || getComputedStyle(el).direction === 'rtl';
}

/**
 * Detects swipes on `ref` with pointer events and reports them in logical directions,
 * so `'start'` is "toward the reading start" in both LTR and RTL. Gestures with more than
 * one pointer (pinch) are ignored until every pointer lifts, and mouse drags are ignored
 * unless `mouse`. Give the element a `touch-action` that leaves the swipe axis to you
 * (`pan-y` for horizontal swipes, `none` when you handle every gesture), or the browser
 * scrolls instead. Listeners are added in an effect, so it is SSR safe.
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, options: UseSwipeOptions) {
  const { enabled = true, threshold = 40, axis = 'x', mouse = false } = options;
  const onSwipeRef = useLatestRef(options.onSwipe);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const pointers = new Set<number>();
    // The gesture in progress; `null` once it is discarded (a second pointer, a cancel).
    let start: { id: number; x: number; y: number } | null = null;

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && (!mouse || e.button !== 0)) return;
      // A primary pointer starts a fresh gesture, so a release we never saw can't wedge it.
      if (e.isPrimary) pointers.clear();
      pointers.add(e.pointerId);
      if (pointers.size === 1) start = { id: e.pointerId, x: e.clientX, y: e.clientY };
      else start = null;
    };
    const up = (e: PointerEvent) => {
      if (!pointers.delete(e.pointerId)) return;
      const s = start;
      start = null;
      if (!s || s.id !== e.pointerId) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      const horizontal = axis === 'x' || (axis === 'both' && Math.abs(dx) >= Math.abs(dy));
      const distance = Math.abs(horizontal ? dx : dy);
      if (distance <= threshold) return;
      let direction: SwipeDirection;
      if (horizontal) {
        const towardEnd = (dx > 0) !== isRtl(el);
        direction = towardEnd ? 'end' : 'start';
      } else direction = dy > 0 ? 'down' : 'up';
      onSwipeRef.current(direction, { distance, deltaX: dx, deltaY: dy, pointerType: e.pointerType, event: e });
    };
    const cancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      start = null;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
    };
  }, [ref, enabled, threshold, axis, mouse, onSwipeRef]);
}

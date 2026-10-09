import type { Placement, Side } from '../components/types';

/** Something with a bounding box: an element, or a virtual anchor such as a caret or pointer position. */
export interface AnchorLike {
  getBoundingClientRect(): DOMRect | { top: number; left: number; right: number; bottom: number; width: number; height: number };
}

export interface PositionOptions {
  placement?: Placement;
  /** Gap between anchor and floating element, in px. */
  offset?: number;
  /** Move to the opposite side when there is not enough room. Default true. */
  flip?: boolean;
  /** Slide along the anchor to stay inside the viewport. Default true. */
  shift?: boolean;
  /** Minimum distance from the viewport edge, in px. */
  padding?: number;
  /** Arrow element to center on the anchor. */
  arrow?: HTMLElement | null;
  /** Make the floating element at least as wide as the anchor (menus, comboboxes). */
  matchWidth?: boolean;
}

export interface PositionResult {
  /** Viewport x/y for `position: fixed`. */
  x: number;
  y: number;
  /** The placement actually used after flipping. */
  placement: Placement;
  side: Side;
  /** Arrow offset along the floating element's edge, in px. */
  arrowOffset?: number;
}

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function splitPlacement(p: Placement): [Side, 'start' | 'center' | 'end'] {
  const [side, align] = p.split('-') as [Side, 'start' | 'end' | undefined];
  return [side, align ?? 'center'];
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * Computes where to put a floating element (menu, popover, tooltip, datepicker)
 * next to an anchor, flipping and shifting so it stays on screen. Coordinates
 * are for `position: fixed`. `start` and `end` follow the anchor's text direction.
 * No dependencies; covers what the components need from Floating UI.
 */
export function computePosition(anchor: AnchorLike, floating: HTMLElement, options: PositionOptions = {}): PositionResult {
  const { placement = 'bottom', offset = 8, flip = true, shift = true, padding = 8, arrow } = options;
  const a = anchor.getBoundingClientRect();
  const fw = floating.offsetWidth;
  const fh = floating.offsetHeight;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = document.documentElement.clientHeight || window.innerHeight;
  const rtl =
    anchor instanceof Element ? getComputedStyle(anchor).direction === 'rtl' : document.documentElement.dir === 'rtl';

  let [side, align] = splitPlacement(placement);

  const room: Record<Side, number> = {
    top: a.top - padding,
    bottom: vh - a.bottom - padding,
    left: a.left - padding,
    right: vw - a.right - padding,
  };
  const need = (s: Side) => (s === 'top' || s === 'bottom' ? fh : fw) + offset;
  if (flip && room[side] < need(side) && room[opposite[side]] > room[side]) side = opposite[side];

  let x: number;
  let y: number;
  const vertical = side === 'top' || side === 'bottom';
  if (vertical) {
    y = side === 'top' ? a.top - fh - offset : a.bottom + offset;
    const startX = rtl ? a.right - fw : a.left;
    const endX = rtl ? a.left : a.right - fw;
    x = align === 'start' ? startX : align === 'end' ? endX : a.left + a.width / 2 - fw / 2;
    if (shift) x = clamp(x, padding, vw - fw - padding);
  } else {
    x = side === 'left' ? a.left - fw - offset : a.right + offset;
    y = align === 'start' ? a.top : align === 'end' ? a.bottom - fh : a.top + a.height / 2 - fh / 2;
    if (shift) y = clamp(y, padding, vh - fh - padding);
  }

  let arrowOffset: number | undefined;
  if (arrow) {
    const size = vertical ? arrow.offsetWidth : arrow.offsetHeight;
    const center = vertical ? a.left + a.width / 2 - x : a.top + a.height / 2 - y;
    arrowOffset = clamp(center - size / 2, 8, (vertical ? fw : fh) - size - 8);
  }

  const used = (align === 'center' ? side : `${side}-${align}`) as Placement;
  return { x: Math.round(x), y: Math.round(y), placement: used, side, arrowOffset };
}

/**
 * Applies `computePosition` to the floating element's inline style and keeps it
 * updated on scroll, resize and size changes. Returns a cleanup function.
 */
export function autoPosition(anchor: AnchorLike, floating: HTMLElement, options: PositionOptions = {}): () => void {
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (options.matchWidth && anchor instanceof Element) {
        floating.style.minWidth = `${anchor.getBoundingClientRect().width}px`;
      }
      const r = computePosition(anchor, floating, options);
      floating.style.left = `${r.x}px`;
      floating.style.top = `${r.y}px`;
      floating.dataset.side = r.side;
      floating.dataset.placement = r.placement;
      if (options.arrow && r.arrowOffset !== undefined) {
        floating.style.setProperty('--os-arrow-offset', `${r.arrowOffset}px`);
      }
    });
  };
  update();
  window.addEventListener('scroll', update, true);
  window.addEventListener('resize', update);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
  ro?.observe(floating);
  if (anchor instanceof Element) ro?.observe(anchor);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update);
    ro?.disconnect();
  };
}

/** True when the browser supports the Popover API (top-layer rendering without portals). */
export const supportsPopover = (): boolean =>
  typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** Shows an element in the top layer when supported, so no `z-index` or `overflow` can clip it. */
export function showInTopLayer(el: HTMLElement) {
  if (!supportsPopover()) return;
  if (!el.hasAttribute('popover')) el.setAttribute('popover', 'manual');
  try {
    if (!el.matches(':popover-open')) el.showPopover();
  } catch {
    /* already shown or detached */
  }
}

export function hideFromTopLayer(el: HTMLElement) {
  if (!supportsPopover()) return;
  try {
    if (el.matches(':popover-open')) el.hidePopover();
  } catch {
    /* already hidden */
  }
}

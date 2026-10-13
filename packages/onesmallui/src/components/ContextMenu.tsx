import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useLatestRef } from '../hooks/useLatestRef';
import { cx } from '../utils/cx';
import { isEditableTarget, matchesHotkey } from '../utils/hotkeys';
import type { AnchorLike } from '../utils/position';
import { cls } from '../utils/prefix';
import type { OverlayAppearance } from './DialogBase';
import { MenuContent, type MenuContentProps } from './Menu';
import { MenuContext, mergeRefs, useMenu, useMenuRoot, type MenuAutoClose } from './MenuBase';

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Gap between the pointer (or focused element) and the menu, in px. */
const OFFSET = 2;
/** Matches `computePosition`'s default viewport padding. */
const PADDING = 8;
/** A touch that moves further than this is a scroll or a drag, not a long press. */
const MOVE_TOLERANCE = 10;

const viewport = () => ({
  w: document.documentElement.clientWidth || window.innerWidth,
  h: document.documentElement.clientHeight || window.innerHeight,
});

const pointRect = (x: number, y: number): Rect => ({ top: y, left: x, right: x, bottom: y, width: 0, height: 0 });

/**
 * Where a keyboard-opened menu anchors: the visible part of the focused element. When that is
 * taller than half the viewport (a canvas, a whole panel), neither side would fit the menu, so it
 * anchors to a point just inside the element's top start corner instead.
 */
function elementAnchor(el: HTMLElement | null): Rect {
  if (!el) return pointRect(PADDING, PADDING);
  const r = el.getBoundingClientRect();
  const { w, h } = viewport();
  const top = Math.max(r.top, 0);
  const bottom = Math.min(r.bottom, h);
  const left = Math.max(r.left, 0);
  const right = Math.min(r.right, w);
  if (bottom - top > h / 2) {
    const rtl = getComputedStyle(el).direction === 'rtl';
    return pointRect(rtl ? right - PADDING : left + PADDING, top + PADDING);
  }
  return { top, left, right, bottom, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
}

/** Caps the menu height to the taller side of the anchor, so the flipped menu always fits on screen. */
function applyMaxSize(el: HTMLElement | null, r: Rect) {
  if (!el) return;
  const room = Math.max(r.top, viewport().h - r.bottom) - PADDING - OFFSET;
  el.style.setProperty('--os-context-menu-max', `${Math.max(Math.floor(room), 88)}px`);
}

/** The element focus returns to: what was focused inside the target, or the target itself. */
function focusedWithin(target: HTMLElement): HTMLElement {
  const active = document.activeElement;
  return active instanceof HTMLElement && target.contains(active) ? active : target;
}

interface ContextMenuContextValue {
  disabled: boolean;
  longPressDelay: number;
  /** Opens (or moves) the menu at `rect`; focus returns to `returnTo` when it closes. */
  openAt: (rect: Rect, returnTo: HTMLElement) => void;
  anchorRect: MutableRefObject<Rect | null>;
  getAnchorRect: () => Rect;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
const useContextMenu = (part: string) => {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error(`<${part}> must be inside <ContextMenu>.`);
  return ctx;
};

export interface ContextMenuProps {
  /** Attach nothing, so the browser's own context menu shows. Also closes an open menu. */
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** How long a touch must be held to open the menu, in ms. */
  longPressDelay?: number;
  appearance?: OverlayAppearance;
  autoClose?: MenuAutoClose;
  children: ReactNode;
}

/**
 * A menu that opens on right-click, Shift+F10, the Menu key or a long press, at the pointer or
 * the focused element. Compose with `ContextMenuTrigger`, `ContextMenuContent` and Menu's items.
 * Right-click is hard to discover and unavailable to many people: every action in it also needs a
 * visible button, menu or keyboard shortcut.
 */
export function ContextMenu({
  disabled = false,
  open,
  defaultOpen = false,
  onOpenChange,
  longPressDelay = 500,
  appearance = 'default',
  autoClose = true,
  children,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const returnTo = useRef<HTMLElement | null>(null);
  const anchorRect = useRef<Rect | null>(null);
  const { value: menu, setAnchor } = useMenuRoot({
    open: isOpen && !disabled,
    setOpenState: setIsOpen,
    placement: 'bottom-start',
    offset: OFFSET,
    autoClose,
    contentRole: 'menu',
    appearance,
    kind: 'context',
    getReturnTarget: () => (returnTo.current?.isConnected ? returnTo.current : null),
  });
  const { triggerRef, contentRef, setOpen } = menu;

  // Close an open menu when it becomes disabled, so the next right-click is the browser's.
  useEffect(() => {
    if (disabled && isOpen) setIsOpen(false);
  }, [disabled, isOpen, setIsOpen]);

  // One virtual anchor for the menu's lifetime: the pointer point, or the target when opened programmatically.
  const virtual = useMemo(() => {
    const getAnchorRect = () => anchorRect.current ?? elementAnchor(triggerRef.current);
    return { getAnchorRect, anchor: { getBoundingClientRect: getAnchorRect } satisfies AnchorLike };
  }, [triggerRef]);
  useLayoutEffect(() => setAnchor(virtual.anchor), [setAnchor, virtual]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      disabled,
      longPressDelay,
      anchorRect,
      getAnchorRect: virtual.getAnchorRect,
      openAt: (rect, target) => {
        anchorRect.current = rect;
        returnTo.current = target;
        // Re-runs positioning even when the menu is already open (a second right-click moves it).
        setAnchor(virtual.anchor);
        applyMaxSize(contentRef.current, rect);
        setOpen(true, { focus: 'first' });
      },
    }),
    [disabled, longPressDelay, virtual, contentRef, setAnchor, setOpen],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
    </ContextMenuContext.Provider>
  );
}

type TriggerChildProps = Record<string, unknown> & {
  onContextMenu?: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove?: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel?: (e: ReactPointerEvent<HTMLElement>) => void;
  onClickCapture?: (e: MouseEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
};

export interface ContextMenuTriggerProps {
  /**
   * The target area: one element. Use a focusable control, or a container of focusable items, so
   * Shift+F10 and the Menu key can reach it. A plain element given `tabIndex={0}` also needs a role
   * and a name (`role="region"` + `aria-label`). No role is added.
   */
  children: ReactElement<Record<string, unknown>>;
}

/** The target's event handlers. Built once per menu; the child's own handlers are read from `latest`. */
function useTargetHandlers(ctx: ContextMenuContextValue, latest: MutableRefObject<TriggerChildProps>) {
  const handlers = useMemo(() => {
    // `suppressUntil` and `swallowClick` swallow the native contextmenu and click that follow a keyboard open or a long press.
    const state: {
      press: { id: number; x: number; y: number; timer: ReturnType<typeof setTimeout>; stop: () => void } | null;
      suppressUntil: number;
      swallowClick: boolean;
    } = { press: null, suppressUntil: 0, swallowClick: false };

    const cancelPress = () => {
      if (!state.press) return;
      clearTimeout(state.press.timer);
      state.press.stop();
      state.press = null;
    };

    const events = {
      onContextMenu: (e: MouseEvent<HTMLElement>) => {
        latest.current.onContextMenu?.(e);
        if (e.defaultPrevented) return;
        const target = e.currentTarget;
        // Text fields inside the target keep the browser's cut, copy and paste menu.
        if (e.target !== target && isEditableTarget(e.target)) return;
        e.preventDefault();
        cancelPress();
        if (Date.now() < state.suppressUntil) return;
        const r = target.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;
        // A keyboard-generated event (some screen readers send one) has no real pointer position.
        const fromPointer = !(x === 0 && y === 0) && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        const focused = focusedWithin(target);
        ctx.openAt(fromPointer ? pointRect(x, y) : elementAnchor(focused), focused);
      },
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        latest.current.onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key !== 'ContextMenu' && !matchesHotkey(e, 'Shift+F10')) return;
        if (e.target !== e.currentTarget && isEditableTarget(e.target)) return;
        e.preventDefault();
        // Some browsers also send a contextmenu event for these keys; it must not move the menu.
        state.suppressUntil = Date.now() + 600;
        const focused = focusedWithin(e.currentTarget);
        ctx.openAt(elementAnchor(focused), focused);
      },
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        latest.current.onPointerDown?.(e);
        state.swallowClick = false;
        if (e.pointerType !== 'touch' || !e.isPrimary || e.defaultPrevented) return;
        cancelPress();
        const target = e.currentTarget;
        const { pointerId: id, clientX: x, clientY: y } = e;
        window.addEventListener('scroll', cancelPress, true);
        const stop = () => window.removeEventListener('scroll', cancelPress, true);
        const timer = setTimeout(() => {
          stop();
          state.press = null;
          // The browser may follow with its own contextmenu (Android) and a click on release.
          state.suppressUntil = Date.now() + 1000;
          state.swallowClick = true;
          ctx.openAt(pointRect(x, y), focusedWithin(target));
        }, ctx.longPressDelay);
        state.press = { id, x, y, timer, stop };
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        latest.current.onPointerMove?.(e);
        if (state.press && state.press.id === e.pointerId && Math.hypot(e.clientX - state.press.x, e.clientY - state.press.y) > MOVE_TOLERANCE) {
          cancelPress();
        }
      },
      onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
        latest.current.onPointerUp?.(e);
        cancelPress();
      },
      onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => {
        latest.current.onPointerCancel?.(e);
        cancelPress();
      },
      onClickCapture: (e: MouseEvent<HTMLElement>) => {
        latest.current.onClickCapture?.(e);
        if (!state.swallowClick) return;
        state.swallowClick = false;
        e.preventDefault();
        e.stopPropagation();
      },
    };
    return { events, cancelPress };
  }, [ctx, latest]);

  // Clear a pending long press on unmount (and when the menu's options change).
  useEffect(() => handlers.cancelPress, [handlers]);
  return handlers.events;
}

/** Wires the target: right-click, Shift+F10, the Menu key and touch long press open the menu. */
export function ContextMenuTrigger({ children }: ContextMenuTriggerProps) {
  const menu = useMenu('ContextMenuTrigger');
  const ctx = useContextMenu('ContextMenuTrigger');
  const childProps = (isValidElement(children) ? children.props : {}) as TriggerChildProps;
  const latest = useLatestRef(childProps);
  const events = useTargetHandlers(ctx, latest);

  if (!isValidElement(children)) return children;
  // Disabled: attach nothing, so the browser's own menu works normally.
  if (ctx.disabled) return children;

  return cloneElement(children, {
    ref: mergeRefs(menu.triggerRef, childProps.ref),
    id: (childProps.id as string) ?? menu.triggerId,
    'data-context-menu-trigger': '',
    'data-state': menu.open ? 'open' : 'closed',
    ...events,
  });
}

export type ContextMenuContentProps = MenuContentProps;

/**
 * The menu panel: Menu's own `MenuContent`, placed at the pointer or the focused element and kept
 * inside the viewport. Name it with `aria-label` (otherwise the target labels it).
 */
export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(function ContextMenuContent(
  { className, onContextMenu, ...rest },
  ref,
) {
  const menu = useMenu('ContextMenuContent');
  const ctx = useContextMenu('ContextMenuContent');
  const local = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!menu.open) return;
    applyMaxSize(local.current, ctx.getAnchorRect());
    const anchor = ctx.anchorRect;
    // The next programmatic open starts from the target again, not the last pointer position.
    return () => {
      anchor.current = null;
    };
  }, [menu.open, ctx]);

  return (
    <MenuContent
      ref={mergeRefs(local, ref)}
      className={cx(cls('context-menu'), className)}
      onContextMenu={(e) => {
        onContextMenu?.(e);
        // No browser menu on top of this one.
        e.preventDefault();
      }}
      {...rest}
    />
  );
});

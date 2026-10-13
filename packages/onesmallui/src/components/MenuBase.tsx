// Internal: the context and root state shared by Menu and ContextMenu. Not exported from the barrel.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, type MutableRefObject, type Ref } from 'react';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import type { OverlayAppearance } from './DialogBase';
import type { Placement } from './types';

/** When the menu closes by itself: `true` on item select or outside click, `'inside'` only on select, `'outside'` only on outside click, `false` never. */
export type MenuAutoClose = boolean | 'inside' | 'outside';
export type FocusIntent = 'first' | 'last' | null;

export interface MenuSetOpenOptions {
  focus?: FocusIntent;
  /** Focus the trigger after closing. `'if-lost'` waits for the click to settle and only refocuses when focus fell to `<body>`. */
  returnFocus?: boolean | 'if-lost';
}

export interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean, opts?: MenuSetOpenOptions) => void;
  root: MenuContextValue | null;
  autoClose: MenuAutoClose;
  contentRole: 'menu' | 'dialog';
  appearance: OverlayAppearance;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  triggerId: string;
  contentId: string;
  focusIntent: MutableRefObject<FocusIntent>;
  isSub: boolean;
  /**
   * `'menu'`: opened by a menu button, which toggles it, so clicks on the trigger are not outside clicks.
   * `'context'`: opened on a target area; a left click on the target closes it, a right click repositions it.
   */
  kind: 'menu' | 'context';
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export const useMenu = (part: string) => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${part}> must be inside <Menu>.`);
  return ctx;
};

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (el: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r) (r as MutableRefObject<T | null>).current = el;
    }
  };
}

export interface UseMenuRootOptions {
  open: boolean;
  setOpenState: (open: boolean) => void;
  placement: ResponsiveValue<Placement>;
  offset: number;
  autoClose: MenuAutoClose;
  contentRole: 'menu' | 'dialog';
  appearance: OverlayAppearance;
  kind?: 'menu' | 'context';
  /** Where focus goes back on close. Defaults to the trigger. */
  getReturnTarget?: () => HTMLElement | null;
}

/** The top-level menu state: floating position, ids, focus intent and focus return. */
export function useMenuRoot({
  open,
  setOpenState,
  placement,
  offset,
  autoClose,
  contentRole,
  appearance,
  kind = 'menu',
  getReturnTarget,
}: UseMenuRootOptions) {
  const id = useId().replace(/:/g, '');
  const focusIntent = useRef<FocusIntent>(null);
  const { anchorRef, floatingRef, setAnchor } = useFloating<HTMLElement, HTMLDivElement>({ open, placement, offset, matchWidth: false });
  const returnTarget = useRef(getReturnTarget);
  useEffect(() => {
    returnTarget.current = getReturnTarget;
  });
  const refocusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(refocusTimer.current), []);

  const setOpen = useCallback<MenuContextValue['setOpen']>(
    (next, opts = {}) => {
      focusIntent.current = opts.focus ?? null;
      setOpenState(next);
      if (next || !opts.returnFocus) return;
      const target = returnTarget.current?.() ?? anchorRef.current;
      if (opts.returnFocus === true) {
        target?.focus();
        return;
      }
      // After an outside click: let the browser move focus to whatever was clicked first.
      clearTimeout(refocusTimer.current);
      refocusTimer.current = setTimeout(() => {
        const active = document.activeElement;
        if (target?.isConnected && (!active || active === document.body)) target.focus({ preventScroll: true });
      }, 0);
    },
    [setOpenState, anchorRef],
  );

  const value = useMemo<MenuContextValue>(
    () => ({
      // `root: null` marks the top-level menu; consumers resolve it with `ctx.root ?? ctx`.
      open,
      setOpen,
      root: null,
      autoClose,
      contentRole,
      appearance,
      triggerRef: anchorRef,
      contentRef: floatingRef,
      triggerId: `os-menu-${id}-trigger`,
      contentId: `os-menu-${id}`,
      focusIntent,
      isSub: false,
      kind,
    }),
    [open, setOpen, autoClose, contentRole, appearance, anchorRef, floatingRef, id, kind],
  );

  return { value, setAnchor };
}

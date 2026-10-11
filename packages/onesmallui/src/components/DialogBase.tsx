// Internal: the native <dialog> lifecycle shared by Dialog and Drawer.
// Not exported from the package index.
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { cls } from '../utils/prefix';

export type OverlayAppearance = 'default' | 'dark' | 'translucent';
export type Backdrop = boolean | 'static';

/** Root attributes for the shared `appearance` prop. */
export function appearanceProps(appearance: OverlayAppearance | undefined) {
  return {
    'data-os-theme': appearance === 'dark' ? 'dark' : undefined,
    'data-appearance': appearance === 'translucent' ? 'translucent' : undefined,
  } as const;
}

let locks = 0;
function lockScroll() {
  locks++;
  document.documentElement.classList.add(cls('scroll-locked'));
}
function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.documentElement.classList.remove(cls('scroll-locked'));
}

export const EXIT_MS = 220;

export interface DialogLifecycleOptions {
  open: boolean;
  onClose: () => void;
  modal: boolean;
  backdrop: Backdrop;
  scrollLock: boolean;
  /** No enter/exit animation. */
  instant: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes on close. Default: the element focused before opening. `false` leaves focus alone. */
  returnFocus?: boolean | RefObject<HTMLElement | null>;
}

/**
 * Opens and closes a native <dialog> from a boolean, with exit animations,
 * scroll locking, initial and return focus, Escape, and backdrop clicks.
 */
export function useDialogLifecycle({
  open,
  onClose,
  modal,
  backdrop,
  scrollLock,
  instant,
  initialFocus,
  returnFocus = true,
}: DialogLifecycleOptions) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const [shake, setShake] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const openRef = useRef(open);
  openRef.current = open;
  const previous = useRef<HTMLElement | null>(null);
  const locked = useRef(false);
  const pressedBackdrop = useRef(false);
  const returnRef = useRef(returnFocus);
  returnRef.current = returnFocus;

  const restoreFocus = () => {
    const target = returnRef.current;
    if (target === false) return;
    const el = typeof target === 'object' ? target.current : previous.current;
    const active = document.activeElement;
    const lost = !active || active === document.body || ref.current?.contains(active);
    if (el && el.isConnected && lost) el.focus({ preventScroll: true });
  };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setClosing(false);
      previous.current = document.activeElement as HTMLElement | null;
      if (modal) {
        if (dialog.showModal) dialog.showModal();
        else dialog.setAttribute('open', '');
      } else if (dialog.show) dialog.show();
      else dialog.setAttribute('open', '');
      if (scrollLock && !locked.current) {
        lockScroll();
        locked.current = true;
      }
      const target = initialFocus?.current;
      if (target) target.focus();
      else if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
        // No autofocus inside: focus the panel so screen readers start at the top.
        const auto = dialog.querySelector<HTMLElement>('[autofocus]');
        (auto ?? dialog.querySelector<HTMLElement>(`[data-dialog-panel]`))?.focus();
      }
    } else if (!open && dialog.open) {
      const finish = () => {
        if (dialog.close) dialog.close();
        else dialog.removeAttribute('open');
        setClosing(false);
        if (locked.current) {
          unlockScroll();
          locked.current = false;
        }
        restoreFocus();
      };
      if (instant) {
        finish();
        return;
      }
      setClosing(true);
      const t = setTimeout(finish, EXIT_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modal]);

  // Unlock on unmount.
  useEffect(
    () => () => {
      if (locked.current) unlockScroll();
      locked.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!shake) return;
    const t = setTimeout(() => setShake(false), 320);
    return () => clearTimeout(t);
  }, [shake]);

  const dialogProps = {
    ref,
    'data-state': closing ? 'closing' : open ? 'open' : 'closed',
    'data-modal': modal ? undefined : 'false',
    'data-backdrop': backdrop === 'static' ? 'static' : backdrop ? undefined : 'none',
    'data-shake': shake || undefined,
    onCancel: (e: SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onCloseRef.current();
    },
    onClose: () => {
      // The browser closed it on its own (e.g. a repeated Escape): sync state.
      if (openRef.current) onCloseRef.current();
      if (locked.current) {
        unlockScroll();
        locked.current = false;
      }
    },
    onKeyDown: (e: KeyboardEvent<HTMLDialogElement>) => {
      // Non-modal dialogs don't get a cancel event.
      if (!modal && e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onCloseRef.current();
      }
    },
    onPointerDown: (e: PointerEvent<HTMLDialogElement>) => {
      pressedBackdrop.current = e.target === e.currentTarget;
    },
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      const onBackdrop = e.target === e.currentTarget && pressedBackdrop.current;
      pressedBackdrop.current = false;
      if (!onBackdrop || !modal || backdrop === false) return;
      if (backdrop === 'static') setShake(true);
      else onCloseRef.current();
    },
  };

  return { ref, closing, dialogProps };
}

/** Spreads `ours` and `theirs`; event handlers present in both are called in turn (theirs first). */
export function mergeProps<A extends Record<string, unknown>, B extends Record<string, unknown>>(ours: A, theirs: B): A & B {
  const out: Record<string, unknown> = { ...ours, ...theirs };
  for (const key of Object.keys(theirs)) {
    const a = ours[key];
    const b = theirs[key];
    if (/^on[A-Z]/.test(key) && typeof a === 'function' && typeof b === 'function') {
      out[key] = (...args: unknown[]) => {
        b(...args);
        a(...args);
      };
    }
  }
  return out as A & B;
}

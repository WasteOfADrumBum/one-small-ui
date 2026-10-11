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
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useLatestRef } from '../hooks/useLatestRef';
import { useScrollLock } from '../hooks/useScrollLock';

export type OverlayAppearance = 'default' | 'dark' | 'translucent';
export type Backdrop = boolean | 'static';

/** Root attributes for the shared `appearance` prop. */
export function appearanceProps(appearance: OverlayAppearance | undefined) {
  return {
    'data-os-theme': appearance === 'dark' ? 'dark' : undefined,
    'data-appearance': appearance === 'translucent' ? 'translucent' : undefined,
  } as const;
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
  // Closing (open → false) plays the exit animation unless `instant`; reopening cancels it.
  const [prevOpen, setPrevOpen] = useState(open);
  // Set when the browser closed the dialog itself (e.g. a repeated Escape): nothing left to animate.
  const [closedNatively, setClosedNatively] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setClosing(!open && !instant && !closedNatively);
    if (open) setClosedNatively(false);
  }
  const [shake, setShake] = useState(false);
  const onCloseRef = useLatestRef(onClose);
  const openRef = useLatestRef(open);
  const pressedBackdrop = useRef(false);
  // Shown from opening until the exit animation ends.
  const visible = open || closing;

  // Declared before the open effect below, so the opener is saved before focus moves in.
  useFocusReturn({
    active: visible,
    target: typeof returnFocus === 'object' ? returnFocus : undefined,
    container: ref,
    restoreOnDeactivate: returnFocus !== false,
  });
  useScrollLock(scrollLock && visible);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (modal) {
        if (dialog.showModal) dialog.showModal();
        else dialog.setAttribute('open', '');
      } else if (dialog.show) dialog.show();
      else dialog.setAttribute('open', '');
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
      };
      if (instant) {
        finish();
        return;
      }
      const t = setTimeout(finish, EXIT_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modal]);

  // Tab and Shift+Tab wrap inside modal dialogs, also where showModal() is unavailable.
  // Declared after the open effect, so the dialog is open before the trap starts.
  useFocusTrap(ref, { active: open && modal, initialFocus: false, returnFocus: false });

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
      if (openRef.current) {
        setClosedNatively(true);
        onCloseRef.current();
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

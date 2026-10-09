import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import type { StatusColor } from './types';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  color?: StatusColor;
  /**
   * Auto-dismiss after this many ms. Defaults to the provider's `defaultDuration`
   * (`null` = stays until dismissed, which satisfies WCAG 2.2.3 No Timing, AAA).
   * Timers pause while the toast is hovered or focused.
   */
  duration?: number | null;
  /** An optional action button. */
  action?: { label: string; onClick: () => void };
  id?: string;
}

interface ToastRecord extends ToastOptions {
  id: string;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom';
  defaultDuration?: number | null;
  /** Maximum toasts shown at once. Older ones are dismissed. */
  limit?: number;
  /** Label for the notifications region. */
  label?: string;
}

let counter = 0;

/** Renders toasts and provides `useToast()` to every child. */
export function ToastProvider({
  children,
  placement = 'bottom-right',
  defaultDuration = null,
  limit = 5,
  label = 'Notifications',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const remove = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const dismiss = useCallback(
    (id: string) => {
      setToasts((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => remove(id), 220);
    },
    [remove],
  );
  const dismissAll = useCallback(() => setToasts([]), []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `os-toast-${++counter}`;
      setToasts((all) => {
        const next = [...all.filter((t) => t.id !== id), { duration: defaultDuration, ...options, id }];
        return next.slice(-limit);
      });
      return id;
    },
    [defaultDuration, limit],
  );

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className={cls('toast-viewport')} data-placement={placement} aria-label={label}>
        <ol className={cls('toast-viewport__list')}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const { title, description, color = 'info', duration, action, leaving } = toast;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const started = useRef(Date.now());

  useEffect(() => {
    if (!duration || paused || leaving) return;
    started.current = Date.now();
    const t = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [duration, paused, leaving, onDismiss]);

  return (
    <li
      className={cx(cls('toast'))}
      data-color={color}
      data-state={leaving ? 'closing' : 'open'}
      role={color === 'danger' ? 'alert' : 'status'}
      aria-atomic="true"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={cls('toast__accent')} aria-hidden="true" />
      <div className={cls('toast__content')}>
        <p className={cls('toast__title')}>{title}</p>
        {description && <p className={cls('toast__description')}>{description}</p>}
        {action && (
          <button
            type="button"
            className={cls('toast__action')}
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      <CloseButton label="Dismiss notification" onClick={onDismiss} />
      {duration ? (
        <span
          className={cls('toast__timer')}
          style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          aria-hidden="true"
        />
      ) : null}
    </li>
  );
}

/** Shows toasts. Must be used inside `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}

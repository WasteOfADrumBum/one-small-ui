import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { AnnouncerProvider, textContent, useAnnouncer, useHasAnnouncer } from '../hooks/useAnnouncer';
import { useLatestRef } from '../hooks/useLatestRef';
import { useTransition } from '../hooks/useTransition';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import { appearanceProps, EXIT_MS, type OverlayAppearance } from './DialogBase';
import type { StatusColor } from './types';

export type ToastPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  /** Aliases for `top-center` / `bottom-center`. */
  | 'top'
  | 'bottom';

/** `'soft'` (default) is a surface card with a colored accent; `'solid'` fills it with the theme color. */
export type ToastVariant = 'soft' | 'solid';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  color?: StatusColor;
  variant?: ToastVariant;
  appearance?: OverlayAppearance;
  /** Icon shown before the title. */
  icon?: ReactNode;
  /** Small meta text in the header, e.g. "2 min ago". */
  time?: ReactNode;
  /**
   * Auto-dismiss after this many ms. Defaults to the provider's `defaultDuration`
   * (`null` = stays until dismissed, which satisfies WCAG 2.2.3 No Timing, AAA).
   * Timers pause while the toast is hovered or focused.
   */
  duration?: number | null;
  /** An optional action button. */
  action?: { label: string; onClick: () => void };
  /** Custom content rendered under the description (buttons, links, progress). */
  content?: ReactNode;
  /** Skip the enter/exit animation. */
  instant?: boolean;
  /** What screen readers hear. Defaults to the title and description text. */
  announcement?: string;
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

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  title?: ReactNode;
  /** Body text. `children` renders as custom content after it. */
  description?: ReactNode;
  color?: StatusColor;
  variant?: ToastVariant;
  appearance?: OverlayAppearance;
  icon?: ReactNode;
  time?: ReactNode;
  /** Auto-dismiss after this many ms; `null` (default) never times out. Pauses on hover and focus. */
  duration?: number | null;
  action?: { label: string; onClick: () => void };
  /** Called by the close button, the action, and the timer. Omit to hide the close button. */
  onDismiss?: () => void;
  dismissLabel?: string;
  instant?: boolean;
  /** `'closing'` plays the exit animation. */
  state?: 'open' | 'closing';
  /** Use `alert` for urgent messages. Defaults to `alert` for `danger`, else `status`. */
  role?: 'status' | 'alert';
  /**
   * Make the toast its own live region (default). `ToastProvider` sets `false` and
   * announces through `useAnnouncer` instead, which is read more reliably.
   */
  live?: boolean;
  as?: 'div' | 'li';
  children?: ReactNode;
}

/**
 * One notification. Used by `ToastProvider`, or on its own for inline or
 * custom-managed notifications (put several in a `ToastStack`).
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    title,
    description,
    color = 'info',
    variant = 'soft',
    appearance = 'default',
    icon,
    time,
    duration = null,
    action,
    onDismiss,
    dismissLabel = 'Dismiss notification',
    instant,
    state = 'open',
    role,
    live = true,
    as: Tag = 'div',
    className,
    children,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const started = useRef(0); // set when the timer starts
  const dismissRef = useLatestRef(onDismiss);
  const leaving = state === 'closing';

  useEffect(() => {
    if (!duration || paused || leaving) return;
    started.current = Date.now();
    const t = setTimeout(() => dismissRef.current?.(), remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [duration, paused, leaving, dismissRef]);

  const hasHeader = icon || time;
  const titleEl = title != null && <p className={cls('toast__title')}>{title}</p>;

  return (
    <Tag
      ref={ref as never}
      className={cx(cls('toast'), className)}
      data-color={color}
      data-variant={variant}
      data-state={state}
      data-instant={instant || undefined}
      role={live ? (role ?? (color === 'danger' ? 'alert' : 'status')) : undefined}
      aria-atomic={live ? true : undefined}
      {...appearanceProps(appearance)}
      onPointerEnter={(e) => {
        setPaused(true);
        onPointerEnter?.(e as never);
      }}
      onPointerLeave={(e) => {
        setPaused(false);
        onPointerLeave?.(e as never);
      }}
      onFocus={(e) => {
        setPaused(true);
        onFocus?.(e as never);
      }}
      onBlur={(e) => {
        setPaused(false);
        onBlur?.(e as never);
      }}
      {...(rest as HTMLAttributes<HTMLElement>)}
    >
      <span className={cls('toast__accent')} aria-hidden="true" />
      <div className={cls('toast__content')}>
        {hasHeader ? (
          <div className={cls('toast__header')}>
            {icon && (
              <span className={cls('toast__icon')} aria-hidden="true">
                {icon}
              </span>
            )}
            {titleEl}
            {time && <small className={cls('toast__time')}>{time}</small>}
          </div>
        ) : (
          titleEl
        )}
        {description && <p className={cls('toast__description')}>{description}</p>}
        {children}
        {action && (
          <button
            type="button"
            className={cls('toast__action')}
            onClick={() => {
              action.onClick();
              dismissRef.current?.();
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && <CloseButton label={dismissLabel} onClick={onDismiss} />}
      {duration ? (
        <span
          className={cls('toast__timer')}
          style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? 'paused' : 'running' }}
          aria-hidden="true"
        />
      ) : null}
    </Tag>
  );
});

export interface ToastStackProps extends HTMLAttributes<HTMLElement> {
  /** Fixed screen position, or `'inline'` to stack in the page flow. */
  placement?: ToastPlacement | 'inline';
  /** Names the region for screen readers. */
  label?: string;
  children?: ReactNode;
}

/** A positioned stack of `Toast`s, for managing toasts yourself. */
export function ToastStack({ placement = 'bottom-right', label = 'Notifications', className, children, ...rest }: ToastStackProps) {
  return (
    <section
      className={cx(cls('toast-viewport'), className)}
      data-placement={normalize(placement)}
      aria-label={label}
      {...rest}
    >
      <div className={cls('toast-viewport__list')}>{children}</div>
    </section>
  );
}

const normalize = (p: ToastPlacement | 'inline') => (p === 'top' ? 'top-center' : p === 'bottom' ? 'bottom-center' : p);

export interface ToastProviderProps {
  children: ReactNode;
  placement?: ToastPlacement;
  defaultDuration?: number | null;
  /** Maximum toasts shown at once. Older ones are dismissed. */
  limit?: number;
  /** Label for the notifications region. */
  label?: string;
  /** Defaults applied to every toast (each `toast()` call can override). */
  defaults?: Pick<ToastOptions, 'variant' | 'appearance' | 'instant' | 'color'>;
}

let counter = 0;

/**
 * Renders toasts and provides `useToast()` to every child. Each toast is announced
 * to screen readers: `danger` toasts assertively, the rest politely. Uses the
 * nearest `AnnouncerProvider`, or mounts its own, so toasts are never silent.
 */
export function ToastProvider(props: ToastProviderProps) {
  const hasAnnouncer = useHasAnnouncer();
  if (hasAnnouncer) return <ToastHost {...props} />;
  return (
    <AnnouncerProvider>
      <ToastHost {...props} />
    </AnnouncerProvider>
  );
}

function ToastHost({
  children,
  placement = 'bottom-right',
  defaultDuration = null,
  limit = 5,
  label = 'Notifications',
  defaults,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const { announce } = useAnnouncer();

  const remove = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  // Marks it leaving; ToastItem removes it once its exit transition ends.
  const dismiss = useCallback((id: string) => setToasts((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t))), []);
  const dismissAll = useCallback(() => setToasts([]), []);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `os-toast-${++counter}`;
      const record = { duration: defaultDuration, ...defaults, ...options, id };
      setToasts((all) => [...all.filter((t) => t.id !== id), record].slice(-limit));
      const message = record.announcement ?? [textContent(record.title), textContent(record.description)].filter(Boolean).join('. ');
      if (message) announce(message, { politeness: record.color === 'danger' ? 'assertive' : 'polite' });
      return id;
    },
    [defaultDuration, limit, defaults, announce],
  );

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className={cls('toast-viewport')} data-placement={normalize(placement)} aria-label={label}>
        <ol className={cls('toast-viewport__list')}>
          {toasts.map(({ id, leaving, content, ...t }) => (
            <ToastItem key={id} {...t} leaving={!!leaving} onDismiss={() => dismiss(id)} onExited={() => remove(id)}>
              {content}
            </ToastItem>
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

type ToastItemProps = Omit<ToastRecord, 'id' | 'content'> & {
  leaving: boolean;
  onDismiss: () => void;
  onExited: () => void;
  children?: ReactNode;
};

/** A provider toast: plays its exit transition, then reports it can be removed. */
function ToastItem({ leaving, onExited, instant, announcement, ...t }: ToastItemProps) {
  void announcement; // already announced by the provider
  const { state } = useTransition(!leaving, { duration: instant ? 0 : EXIT_MS, onExited });
  return <Toast as="li" live={false} instant={instant} {...t} state={state === 'closing' || state === 'closed' ? 'closing' : 'open'} />;
}

/** Shows toasts. Must be used inside `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}

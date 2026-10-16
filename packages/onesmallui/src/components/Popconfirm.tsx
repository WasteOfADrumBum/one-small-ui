import { useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { ErrorIcon } from '../icons/ErrorIcon';
import { WarningIcon } from '../icons/WarningIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button } from './Button';
import type { OverlayAppearance } from './DialogBase';
import { Popover } from './Popover';
import { PopoverContext } from './PopoverContext';
import type { Placement } from './types';

export type PopconfirmVariant = 'default' | 'danger';

export interface PopconfirmProps {
  /** The question, e.g. "Archive this mission?". Names the alert dialog. */
  title: ReactNode;
  /** What happens if they confirm. Describes the alert dialog. */
  message?: ReactNode;
  /** The trigger: one focusable element, usually a Button. */
  children: ReactElement<Record<string, unknown>>;
  /**
   * Runs on Confirm. Return a promise to keep the popover open with the confirm button loading
   * until it settles: it closes when the promise resolves and shows the error inline when it rejects.
   */
  onConfirm?: () => void | Promise<unknown>;
  /** Runs on Cancel, Escape and outside clicks. */
  onCancel?: () => void;
  /** `danger` makes Confirm red and adds a warning icon to the title. */
  variant?: PopconfirmVariant;
  /** Default `'Confirm'`. Name the action ("Delete"), not "OK". */
  confirmLabel?: ReactNode;
  /** Default `'Cancel'`. */
  cancelLabel?: ReactNode;
  /** Announced inside the confirm button while `onConfirm` is pending. */
  loadingText?: string;
  /**
   * Shown when `onConfirm` throws or rejects. A function receives the error. By default the
   * error's own message is shown, else "Something went wrong. Try again."
   */
  errorText?: ReactNode | ((error: unknown) => ReactNode);
  /** Which button gets focus when it opens (default `'cancel'`, the safe choice). */
  initialFocus?: 'cancel' | 'confirm';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: ResponsiveValue<Placement>;
  offset?: number;
  /** Show the pointer arrow. */
  arrow?: boolean;
  appearance?: OverlayAppearance;
  /** Class for the floating panel. */
  className?: string;
  style?: CSSProperties;
}

const defaultError = 'Something went wrong. Try again.';

/**
 * A small confirmation anchored to its trigger: an `alertdialog` on Popover with a title, a
 * message and Cancel / Confirm buttons. For irreversible or high-impact actions, use a Dialog.
 */
export function Popconfirm({
  title,
  message,
  children,
  onConfirm,
  onCancel,
  variant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loadingText,
  errorText,
  initialFocus = 'cancel',
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  offset,
  arrow,
  appearance,
  className,
  style,
}: PopconfirmProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const id = useId().replace(/:/g, '');
  const messageId = `os-popconfirm-${id}-message`;
  const errorId = `os-popconfirm-${id}-error`;
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  // Read synchronously by close requests that arrive while a confirm is running.
  const busy = useRef(false);
  const confirmed = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setError(null);
      setOpen(true);
      return;
    }
    // A pending confirm keeps it open until it settles.
    if (busy.current) return;
    setOpen(false);
    if (confirmed.current) confirmed.current = false;
    else onCancel?.();
  };

  const toMessage = (err: unknown): ReactNode => {
    if (typeof errorText === 'function') return errorText(err);
    if (errorText != null) return errorText;
    if (err instanceof Error && err.message) return err.message;
    return typeof err === 'string' && err ? err : defaultError;
  };

  const panel = (
    <PopconfirmActions
      cancelRef={cancelRef}
      confirmRef={confirmRef}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      loadingText={loadingText}
      danger={variant === 'danger'}
      pending={pending}
      message={message}
      messageId={messageId}
      error={error}
      errorId={errorId}
      onConfirm={async (close) => {
        setError(null);
        let result: unknown;
        try {
          result = onConfirm?.();
          if (result instanceof Promise || (result && typeof (result as PromiseLike<unknown>).then === 'function')) {
            busy.current = true;
            setPending(true);
            await result;
          }
        } catch (err) {
          busy.current = false;
          if (!alive.current) return;
          setPending(false);
          setError(toMessage(err));
          return;
        }
        busy.current = false;
        if (!alive.current) return;
        setPending(false);
        confirmed.current = true;
        close(true);
      }}
    />
  );

  return (
    <Popover
      role="alertdialog"
      title={
        <>
          {variant === 'danger' && <WarningIcon className={cls('popconfirm__icon')} />}
          <span>{title}</span>
        </>
      }
      aria-describedby={message ? messageId : undefined}
      content={panel}
      open={isOpen}
      onOpenChange={handleOpenChange}
      initialFocus={initialFocus === 'confirm' ? confirmRef : cancelRef}
      returnFocusOnDismiss
      closeButton={false}
      trigger="click"
      placement={placement}
      offset={offset}
      arrow={arrow}
      appearance={appearance}
      className={cx(cls('popconfirm'), className)}
      style={style}
    >
      {children}
    </Popover>
  );
}

interface PopconfirmActionsProps {
  cancelRef: RefObject<HTMLButtonElement | null>;
  confirmRef: RefObject<HTMLButtonElement | null>;
  cancelLabel: ReactNode;
  confirmLabel: ReactNode;
  loadingText?: string;
  danger: boolean;
  pending: boolean;
  message: ReactNode;
  messageId: string;
  error: ReactNode;
  errorId: string;
  onConfirm: (close: (returnFocus?: boolean) => void) => void;
}

/** The panel body. Rendered inside Popover, so it can close it and send focus back to the trigger. */
function PopconfirmActions({
  cancelRef,
  confirmRef,
  cancelLabel,
  confirmLabel,
  loadingText,
  danger,
  pending,
  message,
  messageId,
  error,
  errorId,
  onConfirm,
}: PopconfirmActionsProps) {
  const popover = useContext(PopoverContext);
  const close = (returnFocus?: boolean) => popover?.close(returnFocus);
  return (
    <div className={cls('popconfirm__content')} data-variant={danger ? 'danger' : undefined}>
      {message && (
        <div id={messageId} className={cls('popconfirm__message')}>
          {message}
        </div>
      )}
      {error && (
        <p id={errorId} className={cls('popconfirm__error')} role="alert">
          <ErrorIcon className={cls('popconfirm__error-icon')} />
          <span>{error}</span>
        </p>
      )}
      <div className={cls('popconfirm__actions')}>
        <Button ref={cancelRef} variant="ghost" color="neutral" size="sm" disabled={pending} onClick={() => close(true)}>
          {cancelLabel}
        </Button>
        <Button
          ref={confirmRef}
          variant="solid"
          color={danger ? 'danger' : 'primary'}
          size="sm"
          loading={pending}
          loadingText={loadingText}
          aria-describedby={error ? errorId : undefined}
          onClick={() => onConfirm(close)}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

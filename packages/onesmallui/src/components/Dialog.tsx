import { useId, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import type { Breakpoint } from '../hooks/useMediaQuery';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import { appearanceProps, mergeProps, useDialogLifecycle, type Backdrop, type OverlayAppearance } from './DialogBase';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DialogAnimation = 'scale' | 'fade' | 'slide-down' | 'slide-up' | 'none';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean;
  /** Called on Escape, the close button, or a backdrop click (unless `backdrop="static"`). */
  onClose: () => void;
  /** Labels the dialog. Pass `null` and `aria-label` to omit the visible heading. */
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  /** Fill the screen: always (`true`) or only below a breakpoint (`'md'` = below 768px). */
  fullscreen?: boolean | Exclude<Breakpoint, '3xl'>;
  /**
   * `true` (default) uses `showModal()`: focus is trapped and the page is inert.
   * `false` uses `show()`: a floating, non-blocking panel without backdrop.
   */
  modal?: boolean;
  /** `'static'`: backdrop clicks don't close, the dialog nudges instead. `false`: no visible backdrop. */
  backdrop?: Backdrop;
  /** `true` (default): header and footer stay put while the body scrolls. `false`: the whole dialog scrolls with the page. */
  scrollable?: boolean;
  /** Enter/exit motion. `'none'` opens and closes instantly. */
  animation?: DialogAnimation;
  appearance?: OverlayAppearance;
  /** Element to focus on open. Defaults to the first `autoFocus` element, else the browser's choice. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes on close: the opener (default), a specific element, or nowhere (`false`). */
  returnFocus?: boolean | RefObject<HTMLElement | null>;
  hideCloseButton?: boolean;
  closeLabel?: string;
  /** Keep the page scrollable while open. Defaults to locking scroll for modal dialogs. */
  scrollLock?: boolean;
  children?: ReactNode;
}

/**
 * A dialog on the native `<dialog>` element: modal (`showModal()`, focus trapped,
 * page inert) or non-modal (`show()`). Focus moves in on open and returns to the
 * opener on close. Replaces Bootstrap's modal.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  fullscreen,
  modal = true,
  backdrop = true,
  scrollable = true,
  animation = 'scale',
  appearance = 'default',
  initialFocus,
  returnFocus,
  hideCloseButton,
  closeLabel = 'Close dialog',
  scrollLock,
  className,
  children,
  ...rest
}: DialogProps) {
  const id = useId().replace(/:/g, '');
  const titleId = `os-dialog-${id}-title`;
  const descId = description ? `os-dialog-${id}-desc` : undefined;
  const { dialogProps } = useDialogLifecycle({
    open,
    onClose,
    modal,
    backdrop,
    scrollLock: scrollLock ?? modal,
    instant: animation === 'none',
    initialFocus,
    returnFocus,
  });

  return (
    <dialog
      className={cx(cls('dialog'), className)}
      data-size={size}
      data-fullscreen={fullscreen === true ? 'always' : fullscreen || undefined}
      data-scrollable={scrollable ? undefined : 'false'}
      data-animation={animation}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={descId}
      {...appearanceProps(appearance)}
      {...mergeProps(dialogProps, rest)}
    >
      <div className={cls('dialog__panel')} data-dialog-panel="" tabIndex={-1}>
        {(title != null || !hideCloseButton) && (
          <header className={cls('dialog__header')}>
            <div className={cls('dialog__heading')}>
              {title != null && (
                <h2 id={titleId} className={cls('dialog__title')}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className={cls('dialog__description')}>
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && <CloseButton label={closeLabel} onClick={() => onClose()} />}
          </header>
        )}
        <div className={cls('dialog__body')}>{children}</div>
        {footer && <footer className={cls('dialog__footer')}>{footer}</footer>}
      </div>
    </dialog>
  );
}

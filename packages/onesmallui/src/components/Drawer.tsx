import { useId, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { breakpoints, useMediaQuery, type Breakpoint } from '../hooks/useMediaQuery';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import { appearanceProps, mergeProps, useDialogLifecycle, type Backdrop, type OverlayAppearance } from './DialogBase';

/** `start` and `end` follow the text direction; `left` and `right` are physical aliases. */
export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom' | 'left' | 'right';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  /** Width for side drawers, height for top/bottom drawers. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** A rounded, floating sheet inset from the screen edges. */
  sheet?: boolean;
  /**
   * Render the content inline (no dialog, no header) from this breakpoint up, and as a
   * drawer below it. Use for sidebars that collapse on small screens.
   */
  inlineFrom?: Exclude<Breakpoint, '3xl'>;
  /**
   * `true` (default): modal, page inert and scroll-locked.
   * `false`: non-modal; the page stays scrollable and interactive (Bootstrap's "body scrolling").
   */
  modal?: boolean;
  backdrop?: Backdrop;
  /** Keep the page scrollable while a modal drawer is open. */
  scrollLock?: boolean;
  /** Open and close without the slide animation. */
  instant?: boolean;
  appearance?: OverlayAppearance;
  initialFocus?: RefObject<HTMLElement | null>;
  returnFocus?: boolean | RefObject<HTMLElement | null>;
  hideCloseButton?: boolean;
  closeLabel?: string;
  children?: ReactNode;
}

/**
 * A panel that slides in from any edge, on the native `<dialog>`. Header, body
 * and footer parts; modal or non-modal; static backdrop; sheet presentation; and
 * responsive mode that renders inline above a breakpoint. Replaces Bootstrap's offcanvas.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  placement = 'end',
  size = 'md',
  sheet,
  inlineFrom,
  modal = true,
  backdrop = true,
  scrollLock,
  instant = false,
  appearance = 'default',
  initialFocus,
  returnFocus,
  hideCloseButton,
  closeLabel = 'Close',
  className,
  children,
  ...rest
}: DrawerProps) {
  const id = useId().replace(/:/g, '');
  const titleId = `os-drawer-${id}-title`;
  const descId = description ? `os-drawer-${id}-desc` : undefined;
  const wide = useMediaQuery(inlineFrom ? `(min-width: ${breakpoints[inlineFrom]}px)` : 'not all');
  const inline = Boolean(inlineFrom) && wide;
  const { dialogProps } = useDialogLifecycle({
    open: open && !inline,
    onClose,
    modal,
    backdrop,
    scrollLock: scrollLock ?? modal,
    instant,
    initialFocus,
    returnFocus,
  });

  if (inline) {
    const { onCancel: _c, onClose: _o, ...divSafe } = rest as Record<string, unknown>;
    void _c;
    void _o;
    return (
      <div
        className={cx(cls('drawer'), className)}
        data-inline=""
        data-placement={placement}
        {...appearanceProps(appearance)}
        {...(divSafe as HTMLAttributes<HTMLDivElement>)}
      >
        <div className={cls('drawer__panel')}>
          <div className={cls('drawer__body')}>{children}</div>
          {footer && <footer className={cls('drawer__footer')}>{footer}</footer>}
        </div>
      </div>
    );
  }

  return (
    <dialog
      className={cx(cls('drawer'), className)}
      data-placement={placement}
      data-size={size}
      data-sheet={sheet || undefined}
      data-instant={instant || undefined}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={descId}
      {...appearanceProps(appearance)}
      {...mergeProps(dialogProps, rest)}
    >
      <div className={cls('drawer__panel')} data-dialog-panel="" tabIndex={-1}>
        <header className={cls('drawer__header')}>
          <div className={cls('drawer__heading')}>
            {title != null && (
              <h2 id={titleId} className={cls('drawer__title')}>
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className={cls('drawer__description')}>
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && <CloseButton label={closeLabel} onClick={() => onClose()} />}
        </header>
        <div className={cls('drawer__body')}>{children}</div>
        {footer && <footer className={cls('drawer__footer')}>{footer}</footer>}
      </div>
    </dialog>
  );
}

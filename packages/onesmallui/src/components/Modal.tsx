import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean;
  /** Called on Escape, the close button, or a backdrop click. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** `center` is a dialog; the others slide in as a drawer / sheet. */
  placement?: 'center' | 'left' | 'right' | 'bottom';
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  children?: ReactNode;
}

const EXIT_MS = 220;

/**
 * An accessible dialog built on the native `<dialog>` element, so focus is
 * trapped, the page behind is inert, and focus returns to the trigger on close.
 * Use `placement` for drawers and bottom sheets.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  placement = 'center',
  closeOnBackdrop = true,
  closeLabel = 'Close dialog',
  className,
  children,
  ...rest
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId().replace(/:/g, '');
  const titleId = `os-modal-${id}-title`;
  const descId = description ? `os-modal-${id}-desc` : undefined;
  const [closing, setClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setClosing(false);
      dialog.showModal?.();
      document.documentElement.classList.add(cls('scroll-locked'));
    } else if (!open && dialog.open) {
      setClosing(true);
      const t = setTimeout(() => {
        dialog.close();
        setClosing(false);
        document.documentElement.classList.remove(cls('scroll-locked'));
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove(cls('scroll-locked'));
    },
    [],
  );

  return (
    <dialog
      ref={ref}
      className={cx(cls('modal'), className)}
      data-size={size}
      data-placement={placement}
      data-state={closing ? 'closing' : open ? 'open' : 'closed'}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onCloseRef.current();
      }}
      {...rest}
    >
      <div className={cls('modal__panel')}>
        <header className={cls('modal__header')}>
          <div>
            <h2 id={titleId} className={cls('modal__title')}>
              {title}
            </h2>
            {description && (
              <p id={descId} className={cls('modal__description')}>
                {description}
              </p>
            )}
          </div>
          <CloseButton label={closeLabel} onClick={() => onCloseRef.current()} />
        </header>
        <div className={cls('modal__body')}>{children}</div>
        {footer && <footer className={cls('modal__footer')}>{footer}</footer>}
      </div>
    </dialog>
  );
}

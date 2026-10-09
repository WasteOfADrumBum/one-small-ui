import type { HTMLAttributes, ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Drawer } from './Drawer';

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

/**
 * @deprecated Use `Dialog` for centered dialogs and `Drawer` for side panels and sheets.
 * Kept for backward compatibility: `placement="center"` renders a `Dialog`,
 * the other placements render a `Drawer`.
 */
export function Modal({ placement = 'center', closeOnBackdrop = true, closeLabel, ...props }: ModalProps) {
  const backdrop = closeOnBackdrop ? true : 'static';
  if (placement === 'center') {
    return <Dialog backdrop={backdrop} closeLabel={closeLabel ?? 'Close dialog'} {...props} />;
  }
  return <Drawer placement={placement} backdrop={backdrop} closeLabel={closeLabel ?? 'Close dialog'} {...props} />;
}

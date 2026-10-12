import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { CloseIcon } from '../icons/CloseIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Make it specific when there are several on a page ("Dismiss upload alert"). */
  label?: string;
  /** Icon and visual size. The hit area never drops below 44×44px. */
  size?: 'sm' | 'md' | 'lg';
  /** `overlay` sits on a translucent dark disc so it stays visible on photos and dark imagery. */
  variant?: 'default' | 'overlay';
}

/** A reusable "×" dismiss control with an accessible label, used by alerts, dialogs, drawers and toasts. */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(function CloseButton(
  { label = 'Close', size = 'md', variant = 'default', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(cls('close-btn'), className)}
      aria-label={label}
      data-size={size}
      data-variant={variant}
      data-os-theme={variant === 'overlay' ? 'dark' : undefined}
      {...rest}
    >
      <CloseIcon />
    </button>
  );
});

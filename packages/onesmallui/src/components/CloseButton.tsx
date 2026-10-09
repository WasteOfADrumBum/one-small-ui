import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** A 44px square "×" button with an accessible label. */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(function CloseButton(
  { label = 'Close', className, ...rest },
  ref,
) {
  return (
    <button ref={ref} type="button" className={cx(cls('close-btn'), className)} aria-label={label} {...rest}>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  );
});

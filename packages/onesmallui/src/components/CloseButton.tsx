import { forwardRef, type ButtonHTMLAttributes } from 'react';
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
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  );
});

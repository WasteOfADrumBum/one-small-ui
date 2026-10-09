import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { StatusColor } from './types';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  color?: StatusColor;
  title?: ReactNode;
  icon?: ReactNode;
  /** Renders a dismiss button that calls this. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /**
   * `polite` announces the alert when it appears (role="status"); `assertive`
   * interrupts (role="alert") and should be kept for errors. `off` for static content.
   */
  live?: 'polite' | 'assertive' | 'off';
}

const icons: Record<StatusColor, ReactNode> = {
  primary: <path d="M12 8v5m0 3h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
  info: <path d="M12 11v5m0-8h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
  accent: <path d="m12 3 2.6 5.6L20 9.5l-4 4 1 5.5-5-2.7L7 19l1-5.5-4-4 5.4-.9L12 3Z" />,
  success: <path d="m7.5 12.5 3 3 6-6.5M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
  warning: <path d="M12 9v4m0 3h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  danger: <path d="M12 8v5m0 3h.01M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3L8.3 3Z" />,
};

/** Inline messages that tell people about a state change or something that needs attention. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { color = 'info', title, icon, onDismiss, dismissLabel = 'Dismiss', live = 'off', className, children, ...rest },
  ref,
) {
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  return (
    <div ref={ref} className={cx(cls('alert'), className)} data-color={color} role={role} {...rest}>
      <span className={cls('alert__icon')} aria-hidden="true">
        {icon ?? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icons[color]}
          </svg>
        )}
      </span>
      <div className={cls('alert__content')}>
        {title && <p className={cls('alert__title')}>{title}</p>}
        {children && <div className={cls('alert__body')}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={cls('close-btn')} aria-label={dismissLabel} onClick={onDismiss}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
});

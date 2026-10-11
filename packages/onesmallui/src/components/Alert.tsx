import { forwardRef, type AnchorHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { ErrorIcon } from '../icons/ErrorIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { StarIcon } from '../icons/StarIcon';
import { SuccessIcon } from '../icons/SuccessIcon';
import { WarningIcon } from '../icons/WarningIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import type { StatusColor } from './types';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  color?: StatusColor;
  title?: ReactNode;
  /** Replace the default icon, or pass `false` to hide it. */
  icon?: ReactNode | false;
  /**
   * Called when the dismiss button is pressed. On its own it renders the button and
   * leaves removal to you; with `dismissible` (or controlled `open`) the alert also hides.
   */
  onDismiss?: () => void;
  /** Renders a dismiss button and hides the alert when it is pressed (uncontrolled). */
  dismissible?: boolean;
  /** Controlled visibility. Pair with `onOpenChange` (or `useDisclosure`) to show and hide from code. */
  open?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissLabel?: string;
  /**
   * `polite` announces the alert when it appears (role="status"); `assertive`
   * interrupts (role="alert") and should be kept for errors. `off` for static content.
   */
  live?: 'polite' | 'assertive' | 'off';
}

const icons: Record<StatusColor, ReactNode> = {
  // A circled "!" (notice) has no counterpart in the icon set, so it stays drawn here.
  primary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v5m0 3h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
    </svg>
  ),
  secondary: <InfoIcon />,
  info: <InfoIcon />,
  inverse: <InfoIcon />,
  accent: <StarIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  danger: <ErrorIcon />,
};

/** Inline messages that tell people about a state change or something that needs attention. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    color = 'info',
    title,
    icon,
    onDismiss,
    dismissible,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    dismissLabel = 'Dismiss',
    live = 'off',
    className,
    children,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  if (!open) return null;
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  const hides = Boolean(dismissible || (openProp !== undefined && onOpenChange));
  const canDismiss = hides || Boolean(onDismiss);
  return (
    <div
      ref={ref}
      className={cx(cls('alert'), className)}
      data-color={color}
      data-dismissible={canDismiss || undefined}
      role={role}
      {...rest}
    >
      {icon !== false && (
        <span className={cls('alert__icon')} aria-hidden="true">
          {icon ?? icons[color]}
        </span>
      )}
      <div className={cls('alert__content')}>
        {title && <p className={cls('alert__title')}>{title}</p>}
        {children && <div className={cls('alert__body')}>{children}</div>}
      </div>
      {canDismiss && (
        <CloseButton
          label={dismissLabel}
          onClick={() => {
            onDismiss?.();
            if (hides) setOpen(false);
          }}
        />
      )}
    </div>
  );
});

export interface AlertHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading element, to fit your page outline. */
  as?: ElementType;
}

/** A larger heading for alerts with additional content (paragraphs, lists, a divider). */
export const AlertHeading = forwardRef<HTMLHeadingElement, AlertHeadingProps>(function AlertHeading(
  { as: Tag = 'h3', className, ...rest },
  ref,
) {
  return <Tag ref={ref} className={cx(cls('alert__heading'), className)} {...rest} />;
});

/** A link styled to match the alert's color, underlined so it is not identified by color alone. */
export const AlertLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function AlertLink(
  { className, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx(cls('alert__link'), className)} {...rest}>
      {children}
    </a>
  );
});

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Spinner } from './Spinner';
import type { Color, Size } from './types';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  color?: Color;
  size?: Size;
  /** Shows a spinner, sets `aria-busy` and blocks clicks. */
  loading?: boolean;
  /** Text announced while loading. */
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** Square button for a lone icon. Requires `aria-label`. */
  iconOnly?: boolean;
  children?: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  (
    | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & { href?: undefined })
    | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> & { href: string })
  );

/**
 * Buttons trigger actions. Pass `href` to render a link that looks like a button.
 *
 * Styled via `.os-btn` plus `data-variant`, `data-color` and `data-size`, so you
 * can also use the classes directly on any element.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = 'solid',
    color = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth,
    iconOnly,
    className,
    children,
    ...rest
  } = props;

  const shared = {
    className: cx(cls('btn'), className),
    'data-variant': variant,
    'data-color': color,
    'data-size': size,
    'data-loading': loading || undefined,
    'data-full-width': fullWidth || undefined,
    'data-icon-only': iconOnly || undefined,
    'aria-busy': loading || undefined,
  };

  const content = (
    <>
      {loading ? (
        <Spinner size="sm" label={null} className={cls('btn__spinner')} />
      ) : (
        leftIcon && (
          <span className={cls('btn__icon')} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children != null && <span className={cls('btn__label')}>{children}</span>}
      {loading && loadingText && <span className={cls('sr-only')}>{loadingText}</span>}
      {rightIcon && !loading && (
        <span className={cls('btn__icon')} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a ref={ref as Ref<HTMLAnchorElement>} {...anchorProps} {...shared} aria-disabled={loading || undefined}>
        {content}
      </a>
    );
  }

  const { type = 'button', disabled, onClick, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...buttonProps}
      {...shared}
    >
      {content}
    </button>
  );
});

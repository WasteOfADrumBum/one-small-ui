import { createContext, forwardRef, useContext, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Spinner } from './Spinner';
import type { Color, ExtendedSize } from './types';

/**
 * - `solid` filled · `soft` tinted (Bootstrap "subtle") · `outline` border only
 * - `ghost` no background until hover (Bootstrap "text") · `link` looks like a hyperlink
 * - `glow` decorative neon gradient (Bootstrap "styled") · `base` unstyled foundation for custom buttons
 */
export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link' | 'glow' | 'base';
export type ButtonShape = 'default' | 'pill' | 'square';

/** Defaults a ButtonGroup passes to the buttons inside it. */
export interface ButtonDefaults {
  variant?: ButtonVariant;
  color?: Color;
  size?: ExtendedSize;
  shape?: ButtonShape;
}
export const ButtonDefaultsContext = createContext<ButtonDefaults>({});

interface ButtonOwnProps {
  variant?: ButtonVariant;
  color?: Color;
  size?: ExtendedSize;
  /** `pill` fully rounded, `square` no rounding. */
  shape?: ButtonShape;
  /** Shows the pressed/current look, e.g. the current item in a group of links. */
  active?: boolean;
  /**
   * Makes it a toggle button: sets `aria-pressed` so assistive tech announces on/off.
   * Pair with `onClick` to flip your state.
   */
  pressed?: boolean;
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
  const defaults = useContext(ButtonDefaultsContext);
  const {
    variant = defaults.variant ?? 'solid',
    color = defaults.color ?? 'primary',
    size = defaults.size ?? 'md',
    shape = defaults.shape ?? 'default',
    active,
    pressed,
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
    'data-shape': shape === 'default' ? undefined : shape,
    'data-active': active || pressed || undefined,
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
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        aria-current={active ? 'page' : undefined}
        {...anchorProps}
        {...shared}
        aria-disabled={loading || undefined}
      >
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
      aria-pressed={pressed}
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

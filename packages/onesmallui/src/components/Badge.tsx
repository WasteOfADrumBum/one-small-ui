import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Color, Size } from './types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
  variant?: 'soft' | 'solid' | 'outline';
  size?: Exclude<Size, 'lg'>;
  /** Shows a small status dot before the text. Set `pulse` to animate it. */
  dot?: boolean;
  pulse?: boolean;
}

/** Small labels for status, counts and categories. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color = 'neutral', variant = 'soft', size = 'md', dot, pulse, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(cls('badge'), className)}
      data-color={color}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {dot && <span className={cls('badge__dot')} data-pulse={pulse || undefined} aria-hidden="true" />}
      {children}
    </span>
  );
});

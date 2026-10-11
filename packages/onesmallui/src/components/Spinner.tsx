import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ExtendedSize, ThemeColor } from './types';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: ExtendedSize | 'xl';
  /** `border` is a spinning ring, `grow` a pulsing dot. */
  variant?: 'border' | 'grow';
  /** A theme color, or `current` to follow the surrounding text color. Defaults to primary (or `current` inside buttons). */
  color?: ThemeColor | 'current';
  /** Announced to screen readers. Pass `null` when a parent already announces loading. */
  label?: string | null;
}

/**
 * A loading indicator. Customize with `--os-spinner-size`, `--os-spinner-thickness`,
 * `--os-spinner-speed` and `--os-spinner-color`.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', variant = 'border', color, label = 'Loading', className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(cls('spinner'), className)}
      data-size={size}
      data-variant={variant}
      data-color={color}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <span className={cls('spinner__ring')} aria-hidden="true" />
      {label && <span className={cls('sr-only')}>{label}</span>}
    </span>
  );
});

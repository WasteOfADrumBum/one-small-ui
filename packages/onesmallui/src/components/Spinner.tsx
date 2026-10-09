import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Size } from './types';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size;
  /** Announced to screen readers. Pass `null` when a parent already announces loading. */
  label?: string | null;
}

/** An orbiting loading indicator. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(cls('spinner'), className)}
      data-size={size}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <span className={cls('spinner__ring')} aria-hidden="true" />
      {label && <span className={cls('sr-only')}>{label}</span>}
    </span>
  );
});

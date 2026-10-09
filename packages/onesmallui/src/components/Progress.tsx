import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Size, StatusColor } from './types';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–max. Omit for an indeterminate scanning bar. */
  value?: number;
  max?: number;
  label: ReactNode;
  /** Visually hide the label (still announced). */
  hideLabel?: boolean;
  /** Show the percentage next to the label. */
  showValue?: boolean;
  color?: StatusColor;
  size?: Size;
}

/** A linear progress bar with an accessible name and value. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label, hideLabel, showValue, color = 'primary', size = 'md', className, ...rest },
  ref,
) {
  const determinate = typeof value === 'number';
  const pct = determinate ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div ref={ref} className={cx(cls('progress'), className)} data-color={color} data-size={size} {...rest}>
      <div className={cx(cls('progress__meta'), hideLabel && cls('sr-only'))}>
        <span>{label}</span>
        {showValue && determinate && <span aria-hidden="true">{Math.round(pct)}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={determinate ? value : undefined}
        aria-label={typeof label === 'string' ? label : undefined}
        className={cls('progress__track')}
        data-indeterminate={!determinate || undefined}
      >
        <span className={cls('progress__bar')} style={determinate ? { width: `${pct}%` } : undefined} />
      </div>
    </div>
  );
});

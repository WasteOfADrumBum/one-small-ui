import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
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
  /** Show the percentage next to the label, or `inside` the bar (the bar grows tall enough for text). */
  showValue?: boolean | 'inside';
  /** Formats the visible value and `aria-valuetext`, e.g. `(v, max) => \`${v} of ${max} files\``. */
  formatValue?: (value: number, max: number) => string;
  color?: StatusColor;
  size?: Size;
  /** Custom track height (any CSS length). Overrides `size`. */
  height?: CSSProperties['height'];
  /** Diagonal stripes on the bar. */
  striped?: boolean;
  /** Moves the stripes. Stops under reduced motion. */
  animated?: boolean;
}

const pctOf = (value: number, max: number) => Math.max(0, Math.min(100, (value / max) * 100));

/** A linear progress bar with an accessible name and value. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    max = 100,
    label,
    hideLabel,
    showValue,
    formatValue,
    color = 'primary',
    size = 'md',
    height,
    striped,
    animated,
    className,
    style,
    ...rest
  },
  ref,
) {
  const determinate = typeof value === 'number';
  const pct = determinate ? pctOf(value, max) : 0;
  const text = determinate ? (formatValue ? formatValue(value, max) : `${Math.round(pct)}%`) : undefined;
  return (
    <div
      ref={ref}
      className={cx(cls('progress'), className)}
      data-color={color}
      data-size={size}
      data-inside={showValue === 'inside' || undefined}
      style={height !== undefined ? ({ '--os-progress-height': typeof height === 'number' ? `${height}px` : height, ...style } as CSSProperties) : style}
      {...rest}
    >
      <div className={cx(cls('progress__meta'), hideLabel && cls('sr-only'))}>
        <span>{label}</span>
        {showValue === true && determinate && <span aria-hidden="true">{text}</span>}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={determinate ? value : undefined}
        aria-valuetext={formatValue && text ? text : undefined}
        aria-label={typeof label === 'string' ? label : undefined}
        className={cls('progress__track')}
        data-indeterminate={!determinate || undefined}
      >
        <span
          className={cls('progress__bar')}
          data-striped={striped || animated || undefined}
          data-animated={animated || undefined}
          style={determinate ? { width: `${pct}%` } : undefined}
        >
          {showValue === 'inside' && determinate && (
            <span className={cls('progress__value')} aria-hidden="true">
              {text}
            </span>
          )}
        </span>
      </div>
    </div>
  );
});

export interface ProgressSegment {
  value: number;
  /** Names this segment's progressbar ("Photos", "Documents"). */
  label: string;
  color?: StatusColor;
  striped?: boolean;
  animated?: boolean;
  /** Show this segment's value inside it. */
  showValue?: boolean;
}

export interface ProgressStackProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the whole stack. */
  label: ReactNode;
  hideLabel?: boolean;
  segments: ProgressSegment[];
  /** Total the segments add up to (each segment is `value / max` of the track). */
  max?: number;
  size?: Size;
  height?: CSSProperties['height'];
  /** Show a legend with each segment's label and value. */
  legend?: boolean;
  formatValue?: (value: number, max: number) => string;
}

/** Several bars side by side in one track, such as storage by file type. Each segment is its own labelled progressbar. */
export const ProgressStack = forwardRef<HTMLDivElement, ProgressStackProps>(function ProgressStack(
  { label, hideLabel, segments, max = 100, size = 'md', height, legend, formatValue, className, style, ...rest },
  ref,
) {
  const fmt = (v: number) => (formatValue ? formatValue(v, max) : `${Math.round(pctOf(v, max))}%`);
  const inside = segments.some((s) => s.showValue);
  return (
    <div
      ref={ref}
      role="group"
      className={cx(cls('progress'), cls('progress-stack'), className)}
      data-size={size}
      data-inside={inside || undefined}
      style={height !== undefined ? ({ '--os-progress-height': typeof height === 'number' ? `${height}px` : height, ...style } as CSSProperties) : style}
      aria-label={typeof label === 'string' ? label : undefined}
      {...rest}
    >
      <div className={cx(cls('progress__meta'), hideLabel && cls('sr-only'))}>
        <span>{label}</span>
      </div>
      <div className={cls('progress__track')}>
        {segments.map((s) => (
          <span
            key={s.label}
            role="progressbar"
            aria-label={s.label}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={s.value}
            aria-valuetext={formatValue ? `${fmt(s.value)}` : undefined}
            className={cls('progress__bar')}
            data-color={s.color ?? 'primary'}
            data-striped={s.striped || s.animated || undefined}
            data-animated={s.animated || undefined}
            style={{ width: `${pctOf(s.value, max)}%` }}
          >
            {s.showValue && (
              <span className={cls('progress__value')} aria-hidden="true">
                {fmt(s.value)}
              </span>
            )}
          </span>
        ))}
      </div>
      {legend && (
        <ul className={cls('progress__legend')} aria-hidden="true">
          {segments.map((s) => (
            <li key={s.label} data-color={s.color ?? 'primary'}>
              <span className={cls('progress__swatch')} />
              {s.label} <span className={cls('progress__legend-value')}>{fmt(s.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

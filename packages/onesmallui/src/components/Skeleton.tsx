import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

/** `wave` sweeps a highlight across, `pulse` fades in and out, `none` is static. */
export type PlaceholderAnimation = 'wave' | 'pulse' | 'none';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  shape?: 'text' | 'rect' | 'circle';
  /** Number of text lines to render. */
  lines?: number;
  animation?: PlaceholderAnimation;
  /** Tints the placeholder with a theme color. */
  color?: ThemeColor;
}

/** Shimmering placeholders while content loads. Hidden from screen readers; announce loading elsewhere. */
export function Skeleton({
  width,
  height,
  shape = 'text',
  lines = 1,
  animation = 'wave',
  color,
  className,
  style,
  ...rest
}: SkeletonProps) {
  if (shape === 'text' && lines > 1) {
    return (
      <span className={cx(cls('skeleton-group'), className)} aria-hidden="true" style={style} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cls('skeleton')}
            data-shape="text"
            data-animation={animation}
            data-color={color}
            style={{ width: i === lines - 1 ? '60%' : width, height }}
          />
        ))}
      </span>
    );
  }
  return (
    <span
      className={cx(cls('skeleton'), className)}
      data-shape={shape}
      data-animation={animation}
      data-color={color}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export interface PlaceholderProps extends HTMLAttributes<HTMLSpanElement> {
  /** A fraction of the line: a number is a percentage (`60` → 60%), or any CSS width. */
  width?: number | string;
  /** Text size the placeholder stands in for. `inherit` matches the surrounding text. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'inherit';
  animation?: PlaceholderAnimation;
  color?: ThemeColor;
}

/**
 * An inline block that stands in for a word or line of text, sized in `em` so it follows the
 * surrounding font. Put several in a heading or paragraph for a loading card.
 */
export function Placeholder({
  width = 100,
  size = 'inherit',
  animation = 'wave',
  color,
  className,
  style,
  ...rest
}: PlaceholderProps) {
  return (
    <span
      className={cx(cls('placeholder'), className)}
      data-size={size}
      data-animation={animation}
      data-color={color}
      style={{ width: typeof width === 'number' ? `${width}%` : width, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  shape?: 'text' | 'rect' | 'circle';
  /** Number of text lines to render. */
  lines?: number;
}

/** Shimmering placeholders while content loads. Hidden from screen readers; announce loading elsewhere. */
export function Skeleton({ width, height, shape = 'text', lines = 1, className, style, ...rest }: SkeletonProps) {
  if (shape === 'text' && lines > 1) {
    return (
      <span className={cx(cls('skeleton-group'), className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cls('skeleton')}
            data-shape="text"
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
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

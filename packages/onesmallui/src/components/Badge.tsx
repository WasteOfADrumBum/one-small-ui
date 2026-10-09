import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Color } from './types';

export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
  /** `soft` is a tinted (subtle) badge. */
  variant?: 'soft' | 'solid' | 'outline';
  /** `inherit` scales with the parent's font size (em based), e.g. inside headings and buttons. */
  size?: 'sm' | 'md' | 'lg' | 'inherit';
  /** Shows a small status dot before the text. Set `pulse` to animate it. */
  dot?: boolean;
  pulse?: boolean;
  /**
   * Pins the badge to a corner of its nearest positioned parent (a `BadgeAnchor`, a button,
   * an avatar…). The parent gets `position: relative` automatically.
   */
  placement?: BadgePlacement;
  /** Fully rounded pill (default) or a softer rectangle. */
  shape?: 'pill' | 'rounded';
}

/** Small labels for status, counts and categories. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color = 'neutral', variant = 'soft', size = 'md', dot, pulse, placement, shape = 'pill', className, children, ...rest },
  ref,
) {
  // A placed dot is a bare notification indicator: its text is kept for screen readers only.
  const dotOnly = Boolean(dot && placement);
  return (
    <span
      ref={ref}
      className={cx(cls('badge'), className)}
      data-color={color}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-placement={placement}
      data-dot-only={dotOnly || undefined}
      data-pulse={(dotOnly && pulse) || undefined}
      {...rest}
    >
      {dot && !dotOnly && <span className={cls('badge__dot')} data-pulse={pulse || undefined} aria-hidden="true" />}
      {dotOnly ? children && <span className={cls('sr-only')}>{children}</span> : children}
    </span>
  );
});

/** An inline wrapper that positions `<Badge placement>` against its content (an icon, an avatar, an image). */
export const BadgeAnchor = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function BadgeAnchor(
  { className, ...rest },
  ref,
) {
  return <span ref={ref} className={cx(cls('badge-anchor'), className)} {...rest} />;
});

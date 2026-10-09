import type { HTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

/** Content only screen readers announce. */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(cls('sr-only'), className)} {...rest} />;
}

export interface SkipLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** id of the main content, without `#`. */
  targetId?: string;
}

/** "Skip to content" link that appears on keyboard focus (WCAG 2.4.1). */
export function SkipLink({ targetId = 'main', className, children = 'Skip to main content', ...rest }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className={cx(cls('skip-link'), className)} {...rest}>
      {children}
    </a>
  );
}

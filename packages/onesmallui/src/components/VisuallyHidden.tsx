import type { HTMLAttributes, MouseEvent } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

/** Content only screen readers announce. */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(cls('sr-only'), className)} {...rest} />;
}

export interface SkipLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** In-page target, e.g. `"#main"`. Takes precedence over `targetId`. */
  href?: string;
  /** id of the main content, without `#`. Default `"main"`. */
  targetId?: string;
}

/**
 * "Skip to content" link that appears on keyboard focus (WCAG 2.4.1). Activating
 * it moves focus to the target (made focusable with `tabindex="-1"` if needed)
 * without changing the URL hash, so hash routers are unaffected.
 */
export function SkipLink({ href, targetId = 'main', className, children = 'Skip to main content', onClick, ...rest }: SkipLinkProps) {
  const target = href ?? `#${targetId}`;
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !target.startsWith('#')) return;
    const el = document.getElementById(decodeURIComponent(target.slice(1)));
    if (!el) return;
    e.preventDefault();
    if (!el.hasAttribute('tabindex') && el.tabIndex < 0) el.setAttribute('tabindex', '-1');
    el.focus();
    el.scrollIntoView?.({ block: 'start' });
  };
  return (
    <a href={target} className={cx(cls('skip-link'), className)} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

export interface ListGroupProps extends HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  /** Drops the outer border and radius, for use edge to edge inside a card. */
  flush?: boolean;
  /** Renders an `<ol>` with counters. */
  numbered?: boolean;
  /** Lays items out in a row: always (`true`) or from a breakpoint up. */
  horizontal?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md';
}

/** A flexible list for showing a series of items, links or actions. */
export const ListGroup = forwardRef<HTMLUListElement, ListGroupProps>(function ListGroup(
  { flush, numbered, horizontal, size = 'md', className, ...rest },
  ref,
) {
  const Tag = numbered ? 'ol' : 'ul';
  return (
    <Tag
      ref={ref as never}
      className={cx(cls('list-group'), className)}
      data-flush={flush || undefined}
      data-numbered={numbered || undefined}
      data-horizontal={horizontal === true ? 'always' : horizontal || undefined}
      data-size={size}
      {...rest}
    />
  );
});

export interface ListGroupItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onClick'> {
  /** Makes the item a link. */
  href?: string;
  /** Makes the item a button (unless `href` is set). */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Highlights the item. Links and buttons also get `aria-current`. */
  active?: boolean;
  /** Value for `aria-current` when active. Use `"page"` for navigation lists. */
  current?: 'true' | 'page' | 'step' | 'location';
  disabled?: boolean;
  color?: ThemeColor;
  /** Trailing content (a badge, a count, an action). */
  end?: ReactNode;
  /** Extra props for the inner link or button. */
  actionProps?: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonHTMLAttributes<HTMLButtonElement>;
}

export const ListGroupItem = forwardRef<HTMLLIElement, ListGroupItemProps>(function ListGroupItem(
  { href, onClick, active, current = 'true', disabled, color, end, actionProps, className, children, ...rest },
  ref,
) {
  const content = (
    <>
      <span className={cls('list-group__content')}>{children}</span>
      {end && <span className={cls('list-group__end')}>{end}</span>}
    </>
  );
  let body: ReactNode;
  if (href !== undefined) {
    body = (
      <a
        {...actionProps}
        href={disabled ? undefined : href}
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
        aria-current={active ? current : undefined}
        onClick={disabled ? undefined : onClick}
        className={cx(cls('list-group__action'), actionProps?.className)}
      >
        {content}
      </a>
    );
  } else if (onClick) {
    body = (
      <button
        type="button"
        {...actionProps}
        disabled={disabled}
        aria-current={active ? current : undefined}
        onClick={onClick}
        className={cx(cls('list-group__action'), actionProps?.className)}
      >
        {content}
      </button>
    );
  } else body = content;

  return (
    <li
      ref={ref}
      className={cx(cls('list-group__item'), className)}
      data-active={active || undefined}
      data-disabled={disabled || undefined}
      data-actionable={href !== undefined || onClick ? '' : undefined}
      data-color={color}
      aria-current={active && href === undefined && !onClick ? current : undefined}
      {...rest}
    >
      {body}
    </li>
  );
});

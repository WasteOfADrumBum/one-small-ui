import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Size, ThemeColor } from './types';

export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * The pages to show: always the first/last `boundaryCount` pages, `siblingCount` pages either
 * side of the current one, and an ellipsis for each gap of two or more pages.
 * `getPaginationRange(6, 20)` → `[1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 20]`.
 */
export function getPaginationRange(page: number, count: number, siblingCount = 1, boundaryCount = 1): PaginationItem[] {
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  // Slots: boundaries + siblings + current + two ellipses. Show everything when it fits.
  const slots = boundaryCount * 2 + siblingCount * 2 + 3;
  if (count <= slots) return range(1, count);
  const start = range(1, boundaryCount);
  const end = range(count - boundaryCount + 1, count);
  const siblingsStart = Math.max(Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2);
  const siblingsEnd = Math.min(Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2), count - boundaryCount - 1);
  return [
    ...start,
    ...(siblingsStart > boundaryCount + 2 ? (['ellipsis-start'] as const) : siblingsStart === boundaryCount + 2 ? [boundaryCount + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1 ? (['ellipsis-end'] as const) : siblingsEnd === count - boundaryCount - 1 ? [count - boundaryCount] : []),
    ...end,
  ];
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Total number of pages. */
  count: number;
  /** Current page (1-based), controlled. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Link mode: each page is an `<a href>`. `onPageChange` still fires on click (for client routing). */
  getHref?: (page: number) => string;
  siblingCount?: number;
  boundaryCount?: number;
  /** Previous / next controls. */
  showPrevNext?: boolean;
  /** First / last controls. */
  showFirstLast?: boolean;
  variant?: 'outline' | 'soft' | 'ghost';
  size?: Size;
  /** Color of the current page. */
  color?: ThemeColor;
  align?: 'start' | 'center' | 'end';
  /** Names the navigation landmark. */
  'aria-label'?: string;
  /** Accessible names, for translation. */
  labels?: Partial<{
    page: (page: number) => string;
    previous: string;
    next: string;
    first: string;
    last: string;
  }>;
}

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const icons = {
  first: icon('m11 17-5-5 5-5m7 10-5-5 5-5'),
  previous: icon('m15 18-6-6 6-6'),
  next: icon('m9 18 6-6-6-6'),
  last: icon('m13 17 5-5-5-5M6 17l5-5-5-5'),
};

/** Page navigation with numbered links, ellipses, and previous/next and first/last controls. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    count,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    getHref,
    siblingCount = 1,
    boundaryCount = 1,
    showPrevNext = true,
    showFirstLast = false,
    variant = 'outline',
    size = 'md',
    color = 'primary',
    align = 'start',
    labels,
    className,
    'aria-label': ariaLabel = 'Pagination',
    ...rest
  },
  ref,
) {
  const [page, setPage] = useControllableState(pageProp, defaultPage, onPageChange);
  const l = {
    page: (p: number) => `Page ${p}`,
    previous: 'Previous page',
    next: 'Next page',
    first: 'First page',
    last: 'Last page',
    ...labels,
  };

  const control = (target: number, content: ReactNode, opts: { label: string; disabled?: boolean; current?: boolean; kind: string }) => {
    const common = {
      className: cls('pagination__link'),
      'aria-label': opts.label,
      'data-kind': opts.kind,
    };
    if (getHref) {
      return opts.disabled ? (
        <a {...common} role="link" aria-disabled="true">
          {content}
        </a>
      ) : (
        <a
          {...common}
          href={getHref(target)}
          aria-current={opts.current ? 'page' : undefined}
          onClick={() => {
            if (!opts.current) setPage(target);
          }}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        {...common}
        disabled={opts.disabled}
        aria-current={opts.current ? 'page' : undefined}
        onClick={() => !opts.current && setPage(target)}
      >
        {content}
      </button>
    );
  };

  const items = getPaginationRange(page, count, siblingCount, boundaryCount);
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cx(cls('pagination'), className)}
      data-variant={variant}
      data-size={size}
      data-color={color}
      data-align={align}
      {...rest}
    >
      <ul className={cls('pagination__list')}>
        {showFirstLast && <li>{control(1, icons.first, { label: l.first, disabled: page <= 1, kind: 'first' })}</li>}
        {showPrevNext && <li>{control(page - 1, icons.previous, { label: l.previous, disabled: page <= 1, kind: 'previous' })}</li>}
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>{control(item, item, { label: l.page(item), current: item === page, kind: 'page' })}</li>
          ) : (
            <li key={item}>
              <span className={cls('pagination__ellipsis')} aria-hidden="true">
                …
              </span>
            </li>
          ),
        )}
        {showPrevNext && <li>{control(page + 1, icons.next, { label: l.next, disabled: page >= count, kind: 'next' })}</li>}
        {showFirstLast && <li>{control(count, icons.last, { label: l.last, disabled: page >= count, kind: 'last' })}</li>}
      </ul>
    </nav>
  );
});

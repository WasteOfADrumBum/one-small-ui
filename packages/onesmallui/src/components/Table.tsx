import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Visible title of the table (rendered as `<caption>`, its accessible name). */
  caption?: ReactNode;
  captionSide?: 'top' | 'bottom';
  /** Zebra stripes on rows (`true` / `'rows'`) or columns. */
  striped?: boolean | 'rows' | 'columns';
  /** Highlight the row under the pointer. */
  hover?: boolean;
  /** Borders on every cell. */
  bordered?: boolean;
  /** No borders at all. */
  borderless?: boolean;
  /** `'sm'` halves the cell padding. */
  size?: 'sm' | 'md';
  /** `'card'` frames the table as a rounded surface. */
  variant?: 'default' | 'card';
  /** Soft tint for the whole table. Rows and cells accept `data-color` too. */
  color?: ThemeColor;
  /**
   * Below this breakpoint (`true` = `'md'`) each row becomes a card. Cells are labelled
   * from the header row automatically, and table roles are kept for screen readers.
   */
  stacked?: boolean | 'sm' | 'md' | 'lg';
  /** Wrap in a keyboard-scrollable region for wide tables. */
  responsive?: boolean;
  /** Accessible name for the scroll region when there is no `caption`. */
  regionLabel?: string;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T }).current = value;
}

/** Copies header text into each cell's `data-label` and pins table roles (CSS display changes can drop them). */
function labelCells(table: HTMLTableElement) {
  const headRow = table.tHead?.rows[0];
  const labels: string[] = [];
  if (headRow) {
    for (const cell of Array.from(headRow.cells)) {
      for (let i = 0; i < cell.colSpan; i++) labels.push(cell.textContent?.trim() ?? '');
    }
  }
  const setRole = (el: Element, role: string) => {
    if (!el.hasAttribute('role')) el.setAttribute('role', role);
  };
  setRole(table, 'table');
  for (const group of [table.tHead, ...Array.from(table.tBodies), table.tFoot]) {
    if (!group) continue;
    setRole(group, 'rowgroup');
    for (const row of Array.from(group.rows)) {
      setRole(row, 'row');
      let col = 0;
      for (const cell of Array.from(row.cells)) {
        const isHeader = cell.tagName === 'TH';
        if (group === table.tHead) setRole(cell, 'columnheader');
        else setRole(cell, isHeader ? 'rowheader' : 'cell');
        if (group !== table.tHead && !cell.hasAttribute('data-label') && labels[col]) {
          cell.setAttribute('data-label', labels[col]);
        }
        col += cell.colSpan;
      }
    }
  }
}

/** A styled, accessible data table. Pass `<thead>`, `<tbody>` and `<tfoot>` as children. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    caption,
    captionSide = 'top',
    striped,
    hover,
    bordered,
    borderless,
    size = 'md',
    variant = 'default',
    color,
    stacked,
    responsive,
    regionLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  const captionId = `os-table-${useId().replace(/:/g, '')}`;
  const tableRef = useRef<HTMLTableElement | null>(null);
  const setRef = useCallback(
    (node: HTMLTableElement | null) => {
      tableRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  const stackAt = stacked === true ? 'md' : stacked || undefined;

  // Runs after every render so new rows get labels too.
  useEffect(() => {
    if (stackAt && tableRef.current) labelCells(tableRef.current);
  });

  const table = (
    <table
      ref={setRef}
      className={cx(cls('table'), className)}
      data-striped={striped === true ? 'rows' : striped || undefined}
      data-hover={hover || undefined}
      data-bordered={bordered || undefined}
      data-borderless={borderless || undefined}
      data-size={size === 'sm' ? 'sm' : undefined}
      data-variant={variant === 'card' ? 'card' : undefined}
      data-color={color}
      data-caption={caption && captionSide === 'bottom' ? 'bottom' : undefined}
      data-stacked={stackAt}
      {...rest}
    >
      {caption && <caption id={captionId}>{caption}</caption>}
      {children}
    </table>
  );

  if (!responsive) return table;
  return (
    // A focusable, named region so keyboard users can scroll it (WCAG 2.1.1).
    <div
      className={cls('table-responsive')}
      role="region"
      tabIndex={0}
      aria-labelledby={caption && !regionLabel ? captionId : undefined}
      aria-label={regionLabel}
    >
      {table}
    </div>
  );
});

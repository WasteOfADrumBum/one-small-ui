import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useAnnouncer, textContent } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { SortAscIcon } from '../icons/SortAscIcon';
import { SortDescIcon } from '../icons/SortDescIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Menu, MenuCheckboxItem, MenuContent, MenuTrigger } from './Menu';
import { Pagination } from './Pagination';
import { Select } from './Select';
import { Skeleton } from './Skeleton';
import { Table, type TableProps } from './Table';
import { VisuallyHidden } from './VisuallyHidden';

export type SortDirection = 'ascending' | 'descending';

/** One sort key. `sort` is a list of these, most significant first. */
export interface SortRule {
  key: string;
  direction: SortDirection;
}

export type DataTableDensity = 'compact' | 'default' | 'comfortable';

export interface DataTableColumn<Row> {
  /** Unique id of the column. Without `accessor`, also the property read from each row. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Plain-text name for announcements and the Columns menu when `header` is not a string. */
  label?: string;
  /** The value used for sorting, searching and filtering (and shown when there is no `cell`). Default `row[key]`. */
  accessor?: (row: Row) => unknown;
  /** Custom cell content. */
  cell?: (row: Row, index: number) => ReactNode;
  sortable?: boolean;
  /** Custom ascending comparator. Default compares the accessor values (numbers, dates, then text with numeric collation). */
  sortFn?: (a: Row, b: Row) => number;
  align?: 'start' | 'center' | 'end';
  width?: CSSProperties['width'];
  /** Can be hidden from the Columns menu. */
  hideable?: boolean;
  /** Shows a filter input for this column under its header. */
  filterable?: boolean;
  /** Custom column filter. Default: the value's text contains the query (case-insensitive). */
  filter?: (row: Row, query: string) => boolean;
  /** Included in the global search. Default `true`. */
  searchable?: boolean;
  /** Render this column's cells as row headers (`<th scope="row">`). Default: the first visible column. */
  rowHeader?: boolean;
}

export interface DataTableLabels {
  search: string;
  searchPlaceholder: string;
  columns: string;
  selectAll: string;
  selectRow: (rowLabel: string) => string;
  rowsPerPage: string;
  loading: string;
  empty: string;
  pagination: string;
  filterColumn: (column: string) => string;
  range: (from: number, to: number, total: number) => string;
  sorted: (rules: { label: string; direction: SortDirection }[]) => string;
  results: (count: number) => string;
  selected: (count: number) => string;
}

const defaultLabels: DataTableLabels = {
  search: 'Search',
  searchPlaceholder: 'Search…',
  columns: 'Columns',
  selectAll: 'Select all rows',
  selectRow: (label) => `Select ${label}`,
  rowsPerPage: 'Rows per page',
  loading: 'Loading',
  empty: 'No results',
  pagination: 'Pagination',
  filterColumn: (column) => `Filter ${column}`,
  range: (from, to, total) => (total === 0 ? '0 rows' : `${from}–${to} of ${total}`),
  sorted: (rules) =>
    rules.length ? `Sorted by ${rules.map((r) => `${r.label}, ${r.direction}`).join(', then ')}` : 'Sorting removed',
  results: (count) => (count === 1 ? '1 result' : `${count} results`),
  selected: (count) => (count === 0 ? 'No rows selected' : count === 1 ? '1 row selected' : `${count} rows selected`),
};

export interface DataTableProps<Row>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange'> {
  /** The table's accessible name, rendered as `<caption>`. Required. */
  caption: ReactNode;
  /** Keep the caption for screen readers only. */
  hideCaption?: boolean;
  data: Row[];
  columns: DataTableColumn<Row>[];
  /** Stable id per row (selection, keys, submitted values). Default `row.id`, else the index. */
  getRowId?: (row: Row, index: number) => string;
  /** Text naming a row, for its checkbox ("Select Ada Lovelace"). Default: the row header cell's value. */
  getRowLabel?: (row: Row) => string;

  // Sorting
  sort?: SortRule[];
  defaultSort?: SortRule[];
  onSortChange?: (sort: SortRule[]) => void;
  /** Shift + click (or Shift + Enter) adds a column to the sort. */
  multiSort?: boolean;

  // Filtering
  /** Shows the global search input. */
  searchable?: boolean;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (query: string) => void;
  /** Per-column filter queries, keyed by column key. */
  columnFilters?: Record<string, string>;
  defaultColumnFilters?: Record<string, string>;
  onColumnFiltersChange?: (filters: Record<string, string>) => void;

  // Pagination
  /** Splits rows into pages with a Pagination and a rows-per-page Select. */
  pagination?: boolean;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  /** Default: the first of `pageSizeOptions`. */
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  // Selection
  /** Adds a checkbox column with an indeterminate "select all" for the visible rows. */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isRowSelectable?: (row: Row) => boolean;
  /** Submits each selected id as a hidden input with this name. */
  name?: string;
  /** Disables the selection checkboxes (and skips the hidden inputs, like a disabled field). */
  disabled?: boolean;
  /** Selection is shown but can't be changed; ids still submit. */
  readOnly?: boolean;
  /** Marks the selection invalid (`aria-invalid` on the checkboxes). */
  invalid?: boolean;

  // Columns
  hiddenColumns?: string[];
  defaultHiddenColumns?: string[];
  onHiddenColumnsChange?: (keys: string[]) => void;

  // Layout
  density?: DataTableDensity;
  stickyHeader?: boolean;
  /** Caps the scroll region's height, e.g. `'24rem'`; pair with `stickyHeader`. */
  maxHeight?: CSSProperties['maxHeight'];
  /** Extra props for the inner `Table` (striped, hover, bordered, variant, color). */
  tableProps?: Omit<TableProps, 'caption' | 'children' | 'density' | 'stickyHeader' | 'responsive'>;
  /** Extra toolbar content, e.g. bulk actions. */
  toolbar?: ReactNode;

  // States
  loading?: boolean;
  /** Skeleton rows shown while loading. */
  loadingRows?: number;
  /** Shown when there are no rows. */
  emptyState?: ReactNode;

  // Server mode
  /** Server-side mode: no client sorting, filtering or paging. Handle the callbacks and pass the current page as `data`. */
  manual?: boolean;
  /** Total rows on the server (manual pagination). Default `data.length`. */
  rowCount?: number;

  /** Texts, for translation. */
  labels?: Partial<DataTableLabels>;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Ascending comparison of two cell values; empty values sort last. */
export function compareValues(a: unknown, b: unknown): number {
  const empty = (v: unknown) => v == null || v === '';
  if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

const valueText = (v: unknown): string => {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(valueText).join(' ');
  return String(v);
};

function getValue<Row>(row: Row, col: DataTableColumn<Row>): unknown {
  return col.accessor ? col.accessor(row) : (row as Record<string, unknown>)[col.key];
}

const columnLabel = <Row,>(col: DataTableColumn<Row>) => col.label ?? (textContent(col.header) || col.key);

/** Next rules after activating a column's sort button. `add` keeps the other rules (multi-sort). */
function nextSort(rules: SortRule[], key: string, add: boolean): SortRule[] {
  const current = rules.find((r) => r.key === key);
  const nextDir: SortDirection | null = !current ? 'ascending' : current.direction === 'ascending' ? 'descending' : null;
  if (!add) return nextDir ? [{ key, direction: nextDir }] : [];
  if (!current) return [...rules, { key, direction: 'ascending' }];
  return nextDir ? rules.map((r) => (r.key === key ? { key, direction: nextDir } : r)) : rules.filter((r) => r.key !== key);
}

const RESULTS_DELAY = 400;

function DataTableInner<Row>(
  {
    caption,
    hideCaption,
    data,
    columns,
    getRowId,
    getRowLabel,
    sort: sortProp,
    defaultSort = [],
    onSortChange,
    multiSort,
    searchable,
    globalFilter: globalFilterProp,
    defaultGlobalFilter = '',
    onGlobalFilterChange,
    columnFilters: columnFiltersProp,
    defaultColumnFilters = {},
    onColumnFiltersChange,
    pagination,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    pageSizeOptions = [10, 25, 50],
    pageSize: pageSizeProp,
    defaultPageSize = pageSizeOptions[0] ?? 10,
    onPageSizeChange,
    selectable,
    selectedIds: selectedProp,
    defaultSelectedIds = [],
    onSelectionChange,
    isRowSelectable,
    name,
    disabled,
    readOnly,
    invalid,
    hiddenColumns: hiddenProp,
    defaultHiddenColumns = [],
    onHiddenColumnsChange,
    density = 'default',
    stickyHeader,
    maxHeight,
    tableProps,
    toolbar,
    loading,
    loadingRows = 5,
    emptyState,
    manual,
    rowCount,
    labels,
    className,
    ...rest
  }: DataTableProps<Row>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const l = { ...defaultLabels, ...labels };
  const id = `os-data-table-${useId().replace(/:/g, '')}`;
  const captionId = `${id}-caption`;
  const { announce } = useAnnouncer();

  const [sort, setSort] = useControllableState(sortProp, defaultSort, onSortChange);
  const [globalFilter, setGlobalFilter] = useControllableState(globalFilterProp, defaultGlobalFilter, onGlobalFilterChange);
  const [columnFilters, setColumnFilters] = useControllableState(columnFiltersProp, defaultColumnFilters, onColumnFiltersChange);
  const [page, setPage] = useControllableState(pageProp, defaultPage, onPageChange);
  const [pageSize, setPageSize] = useControllableState(pageSizeProp, defaultPageSize, onPageSizeChange);
  const [selected, setSelected] = useControllableState(selectedProp, defaultSelectedIds, onSelectionChange);
  const [hidden, setHidden] = useControllableState(hiddenProp, defaultHiddenColumns, onHiddenColumnsChange);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));
  const rowHeaderKey = (visibleColumns.find((c) => c.rowHeader) ?? visibleColumns[0])?.key;
  const rowHeaderCol = columns.find((c) => c.key === rowHeaderKey);
  const rowId = useCallback(
    (row: Row, index: number) => {
      if (getRowId) return getRowId(row, index);
      const own = (row as { id?: unknown }).id;
      return own != null ? String(own) : String(index);
    },
    [getRowId],
  );

  // ---------- Client-side pipeline (skipped in manual mode) ----------
  const query = globalFilter.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (manual) return data;
    const active = Object.entries(columnFilters).filter(([, q]) => q.trim() !== '');
    if (!query && !active.length) return data;
    const searchCols = visibleColumns.filter((c) => c.searchable !== false);
    return data.filter((row) => {
      if (query && !searchCols.some((c) => valueText(getValue(row, c)).toLowerCase().includes(query))) return false;
      return active.every(([key, q]) => {
        const col = columns.find((c) => c.key === key);
        if (!col) return true;
        if (col.filter) return col.filter(row, q);
        return valueText(getValue(row, col)).toLowerCase().includes(q.trim().toLowerCase());
      });
    });
    // visibleColumns is derived from columns and hidden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual, data, columns, hidden, query, columnFilters]);

  const sorted = useMemo(() => {
    if (manual || !sort.length) return filtered;
    const rules = sort
      .map((r) => ({ col: columns.find((c) => c.key === r.key), sign: r.direction === 'descending' ? -1 : 1 }))
      .filter((r): r is { col: DataTableColumn<Row>; sign: number } => !!r.col);
    return filtered
      .map((row, i) => ({ row, i }))
      .sort((a, b) => {
        for (const { col, sign } of rules) {
          const d = col.sortFn ? col.sortFn(a.row, b.row) : compareValues(getValue(a.row, col), getValue(b.row, col));
          if (d) return d * sign;
        }
        return a.i - b.i;
      })
      .map((x) => x.row);
  }, [manual, filtered, sort, columns]);

  const total = manual ? (rowCount ?? data.length) : sorted.length;
  const pageCount = pagination ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const rows = useMemo(
    () => (pagination && !manual ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted),
    [pagination, manual, sorted, currentPage, pageSize],
  );
  const firstIndex = pagination ? (currentPage - 1) * pageSize : 0;

  // ---------- Announcements ----------
  // Filter result counts wait for typing to pause, and in manual mode for loading to end.
  const filterPending = useRef(false);
  useEffect(() => {
    if (!filterPending.current || loading) return;
    const t = setTimeout(() => {
      filterPending.current = false;
      announce(l.results(total));
    }, RESULTS_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the result changes
  }, [query, columnFilters, total, loading, data]);

  const wasLoading = useRef(loading);
  useEffect(() => {
    if (loading && !wasLoading.current) announce(l.loading);
    wasLoading.current = loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- announce on the change only
  }, [loading]);

  // ---------- Handlers ----------
  const resetPage = () => {
    if (pagination && page !== 1) setPage(1);
  };

  const onSort = (key: string, add: boolean) => {
    const next = nextSort(sort, key, add && !!multiSort);
    setSort(next);
    announce(
      l.sorted(
        next.map((r) => {
          const col = columns.find((c) => c.key === r.key);
          return { label: col ? columnLabel(col) : r.key, direction: r.direction };
        }),
      ),
    );
  };

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    filterPending.current = true;
    setGlobalFilter(e.target.value);
    resetPage();
  };

  const onColumnFilter = (key: string, value: string) => {
    filterPending.current = true;
    setColumnFilters({ ...columnFilters, [key]: value });
    resetPage();
  };

  const selectionLocked = disabled || readOnly;
  const canSelect = (row: Row) => !isRowSelectable || isRowSelectable(row);
  const pageIds = rows.flatMap((row, i) => (canSelect(row) ? [rowId(row, firstIndex + i)] : []));
  const pageSelected = pageIds.filter((rid) => selected.includes(rid)).length;
  const allState = pageIds.length > 0 && pageSelected === pageIds.length ? 'all' : pageSelected > 0 ? 'some' : 'none';

  const commitSelection = (next: string[]) => {
    setSelected(next);
    announce(l.selected(next.length));
  };
  const toggleRow = (rid: string) => {
    if (selectionLocked) return;
    commitSelection(selected.includes(rid) ? selected.filter((x) => x !== rid) : [...selected, rid]);
  };
  const toggleAll = () => {
    if (selectionLocked) return;
    commitSelection(
      allState === 'all' ? selected.filter((x) => !pageIds.includes(x)) : [...selected, ...pageIds.filter((x) => !selected.includes(x))],
    );
  };

  const hideableColumns = columns.filter((c) => c.hideable);
  const setColumnVisible = (key: string, visible: boolean) => {
    // Never hide the last visible column.
    if (!visible && visibleColumns.length <= 1) return;
    setHidden(visible ? hidden.filter((k) => k !== key) : [...hidden, key]);
  };

  // ---------- Render ----------
  const colCount = visibleColumns.length + (selectable ? 1 : 0);
  const hasFilterRow = visibleColumns.some((c) => c.filterable);
  const captionText = textContent(caption);

  const sortButton = (col: DataTableColumn<Row>) => {
    const rule = sort.find((r) => r.key === col.key);
    const priority = sort.length > 1 && rule ? sort.indexOf(rule) + 1 : undefined;
    const Icon = rule?.direction === 'descending' ? SortDescIcon : SortAscIcon;
    return (
      <button
        type="button"
        className={cls('data-table__sort')}
        data-state={rule ? rule.direction : undefined}
        onClick={(e: MouseEvent<HTMLButtonElement>) => onSort(col.key, e.shiftKey)}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            onSort(col.key, true);
          }
        }}
      >
        <span className={cls('data-table__sort-label')}>{col.header}</span>
        <Icon className={cls('data-table__sort-icon')} />
        {priority && (
          <span className={cls('data-table__sort-priority')} aria-hidden="true">
            {priority}
          </span>
        )}
      </button>
    );
  };

  const headerCells = visibleColumns.map((col) => {
    const rule = sort.find((r) => r.key === col.key);
    // aria-sort belongs on one header at a time: the most significant sort.
    const ariaSort = col.sortable ? (rule && sort[0] === rule ? rule.direction : 'none') : undefined;
    return (
      <th
        key={col.key}
        scope="col"
        aria-sort={ariaSort}
        data-align={col.align}
        data-sortable={col.sortable || undefined}
        style={col.width !== undefined ? { width: col.width } : undefined}
      >
        {col.sortable ? sortButton(col) : col.header}
      </th>
    );
  });

  const renderCell = (col: DataTableColumn<Row>, row: Row, index: number) => {
    const content = col.cell ? col.cell(row, index) : valueText(getValue(row, col));
    return col.key === rowHeaderKey ? (
      <th key={col.key} scope="row" data-align={col.align}>
        {content}
      </th>
    ) : (
      <td key={col.key} data-align={col.align}>
        {content}
      </td>
    );
  };

  let body: ReactNode;
  if (loading) {
    body = Array.from({ length: loadingRows }, (_, r) => (
      <tr key={`loading-${r}`} data-loading="">
        {selectable && <td className={cls('data-table__select')} />}
        {visibleColumns.map((col, c) => (
          <td key={col.key} data-align={col.align}>
            {r === 0 && c === 0 && <VisuallyHidden>{l.loading}</VisuallyHidden>}
            <Skeleton width={`${60 + ((r * 7 + c * 13) % 35)}%`} />
          </td>
        ))}
      </tr>
    ));
  } else if (rows.length === 0) {
    body = (
      <tr data-empty="">
        <td colSpan={colCount} className={cls('data-table__empty')}>
          {emptyState ?? l.empty}
        </td>
      </tr>
    );
  } else {
    body = rows.map((row, i) => {
      const index = firstIndex + i;
      const rid = rowId(row, index);
      const isSelected = selected.includes(rid);
      const rowLabel = getRowLabel ? getRowLabel(row) : rowHeaderCol ? valueText(getValue(row, rowHeaderCol)) : rid;
      return (
        <tr key={rid} data-selected={(selectable && isSelected) || undefined}>
          {selectable && (
            <td className={cls('data-table__select')}>
              <Checkbox
                label={<VisuallyHidden>{l.selectRow(rowLabel)}</VisuallyHidden>}
                checked={isSelected}
                disabled={disabled || !canSelect(row)}
                aria-readonly={readOnly || undefined}
                invalid={invalid}
                onChange={() => toggleRow(rid)}
              />
            </td>
          )}
          {visibleColumns.map((col) => renderCell(col, row, index))}
        </tr>
      );
    });
  }

  const from = total === 0 ? 0 : firstIndex + 1;
  const to = pagination ? Math.min(total, currentPage * pageSize) : total;
  const showToolbar = searchable || hideableColumns.length > 0 || toolbar;

  return (
    <div
      ref={ref}
      className={cx(cls('data-table'), className)}
      data-density={density === 'default' ? undefined : density}
      data-loading={loading || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
      {...rest}
    >
      {showToolbar && (
        <div className={cls('data-table__toolbar')}>
          {searchable && (
            <Input
              type="search"
              className={cls('data-table__search')}
              aria-label={labels?.search ?? (captionText ? `${l.search} ${captionText}` : l.search)}
              placeholder={l.searchPlaceholder}
              value={globalFilter}
              onChange={onSearch}
              startAdornment={<SearchIcon />}
              autoComplete="off"
            />
          )}
          {toolbar}
          {hideableColumns.length > 0 && (
            <div className={cls('data-table__columns')}>
              <Menu placement="bottom-end" autoClose="outside">
                <MenuTrigger>
                  <Button variant="outline" color="neutral" rightIcon={<ChevronDownIcon />}>
                    {l.columns}
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  {hideableColumns.map((col) => {
                    const visible = !hidden.includes(col.key);
                    return (
                      <MenuCheckboxItem
                        key={col.key}
                        checked={visible}
                        disabled={visible && visibleColumns.length <= 1}
                        onCheckedChange={(on) => setColumnVisible(col.key, on)}
                      >
                        {columnLabel(col)}
                      </MenuCheckboxItem>
                    );
                  })}
                </MenuContent>
              </Menu>
            </div>
          )}
        </div>
      )}

      {/* A focusable, named region so keyboard users can scroll wide or tall tables (WCAG 2.1.1). */}
      <div
        className={cls('data-table__scroll')}
        role="region"
        tabIndex={0}
        aria-labelledby={captionId}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
        data-scroll-y={maxHeight !== undefined || undefined}
      >
        <Table
          {...tableProps}
          className={cx(cls('data-table__table'), tableProps?.className)}
          density={density}
          stickyHeader={stickyHeader}
          aria-busy={loading || undefined}
        >
          <caption id={captionId} className={hideCaption ? cls('sr-only') : undefined}>
            {caption}
          </caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className={cls('data-table__select')}>
                  <Checkbox
                    label={<VisuallyHidden>{l.selectAll}</VisuallyHidden>}
                    checked={allState === 'all'}
                    indeterminate={allState === 'some'}
                    disabled={disabled || loading || pageIds.length === 0}
                    aria-readonly={readOnly || undefined}
                    invalid={invalid}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {headerCells}
            </tr>
            {hasFilterRow && (
              <tr className={cls('data-table__filters')}>
                {selectable && <td />}
                {visibleColumns.map((col) => (
                  <td key={col.key}>
                    {col.filterable && (
                      <Input
                        type="search"
                        aria-label={l.filterColumn(columnLabel(col))}
                        value={columnFilters[col.key] ?? ''}
                        onChange={(e) => onColumnFilter(col.key, e.target.value)}
                        autoComplete="off"
                      />
                    )}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody>{body}</tbody>
        </Table>
      </div>

      {pagination && (
        <div className={cls('data-table__footer')}>
          <div className={cls('data-table__page-size')}>
            <label htmlFor={`${id}-size`}>{l.rowsPerPage}</label>
            <Select
              id={`${id}-size`}
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                resetPage();
              }}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            />
          </div>
          <span className={cls('data-table__range')}>{l.range(from, to, total)}</span>
          <Pagination
            count={pageCount}
            page={currentPage}
            onPageChange={setPage}
            aria-label={labels?.pagination ?? (captionText ? `${captionText} ${l.pagination.toLowerCase()}` : l.pagination)}
          />
        </div>
      )}

      {name &&
        !disabled &&
        selected.map((rid) => <input key={rid} type="hidden" name={name} value={rid} />)}
    </div>
  );
}

/**
 * A data table built on `Table` with native table semantics: sortable headers (`aria-sort`),
 * global and per-column filtering, pagination, row selection that submits with forms,
 * column visibility, loading and empty states, and a server-side (`manual`) mode.
 */
export const DataTable = forwardRef(DataTableInner) as <Row>(
  props: DataTableProps<Row> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;

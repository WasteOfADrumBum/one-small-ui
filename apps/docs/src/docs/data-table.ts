import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'data-table',
  order: 50,
  name: 'DataTable',
  group: 'Data display',
  summary:
    'A data table built on Table with native table semantics: sortable headers with aria-sort and optional multi-sort, global search and per-column filters, pagination with a rows-per-page select, row selection that submits with forms, a Columns menu, sticky headers, three densities, loading and empty states, and a server-side mode.',
  importLine: "import { DataTable, type DataTableColumn, type SortRule } from '@onesmall/ui';",
  examples: [
    {
      name: 'data-table-basic',
      title: 'Sorting, search, pagination and column visibility',
      description: 'Shift + click a second header to sort by it too. Hideable columns appear in the Columns menu.',
    },
    {
      name: 'data-table-selection',
      title: 'Row selection and form submission',
      description: 'Each row checkbox is named after its row. Selected ids submit as hidden inputs; inactive members cannot be picked.',
    },
    {
      name: 'data-table-server',
      title: 'Server-side data',
      description: 'With manual, the table only reports sort, search and page changes. Fetch the page yourself and pass rowCount.',
    },
    {
      name: 'data-table-layout',
      title: 'Density, sticky header and column filters',
      description: 'maxHeight makes the region scroll vertically, so the header sticks. The caption is visually hidden but still names the table.',
    },
  ],
  props: [
    {
      title: 'DataTable',
      props: [
        { name: 'caption', type: 'ReactNode', description: 'Required. The table\'s accessible name, rendered as <caption>. Also names the scroll region, search and pagination.' },
        { name: 'hideCaption', type: 'boolean', description: 'Keep the caption for screen readers only.' },
        { name: 'data', type: 'Row[]', description: 'Rows. In manual mode, the current page only.' },
        { name: 'columns', type: 'DataTableColumn<Row>[]', description: 'Column definitions (below).' },
        { name: 'getRowId', type: '(row, index) => string', default: 'row.id, else the index', description: 'Stable id for keys, selection and submitted values.' },
        { name: 'getRowLabel', type: '(row) => string', default: 'row header value', description: 'Names each row checkbox: "Select Ada Lovelace".' },
        { name: 'sort / defaultSort / onSortChange', type: "{ key, direction: 'ascending' | 'descending' }[]", default: '[]', description: 'Sort rules, most significant first. Each header press cycles ascending, descending, none.' },
        { name: 'multiSort', type: 'boolean', description: 'Shift + click or Shift + Enter adds a column to the sort.' },
        { name: 'searchable', type: 'boolean', description: 'Shows the global search input.' },
        { name: 'globalFilter / defaultGlobalFilter / onGlobalFilterChange', type: 'string', default: "''", description: 'Search query. Matches visible, searchable columns, case-insensitive.' },
        { name: 'columnFilters / defaultColumnFilters / onColumnFiltersChange', type: 'Record<string, string>', default: '{}', description: 'Per-column queries for filterable columns.' },
        { name: 'pagination', type: 'boolean', description: 'Pages the rows and shows Pagination and a rows-per-page Select.' },
        { name: 'page / defaultPage / onPageChange', type: 'number', default: '1', description: 'Current page (1-based). Changing a filter or the page size returns to page 1.' },
        { name: 'pageSize / defaultPageSize / onPageSizeChange', type: 'number', default: 'pageSizeOptions[0]', description: 'Rows per page.' },
        { name: 'pageSizeOptions', type: 'number[]', default: '[10, 25, 50]', description: 'Choices in the rows-per-page select.' },
        { name: 'selectable', type: 'boolean', description: 'Adds a checkbox column. Select all toggles the selectable rows on the current page and shows a dash when some are selected.' },
        { name: 'selectedIds / defaultSelectedIds / onSelectionChange', type: 'string[]', default: '[]', description: 'Selected row ids.' },
        { name: 'isRowSelectable', type: '(row) => boolean', description: 'Disables the checkbox for rows that return false.' },
        { name: 'name', type: 'string', description: 'Submits each selected id as a hidden input with this name.' },
        { name: 'disabled / readOnly / invalid', type: 'boolean', description: 'Selection states. disabled also skips the hidden inputs; readOnly keeps them and blocks changes; invalid sets aria-invalid on the checkboxes.' },
        { name: 'hiddenColumns / defaultHiddenColumns / onHiddenColumnsChange', type: 'string[]', default: '[]', description: 'Keys of hidden columns. The last visible column cannot be hidden.' },
        { name: 'density', type: "'compact' | 'default' | 'comfortable'", default: "'default'", description: 'Cell padding. Rows with checkboxes stay at least 44px tall.' },
        { name: 'stickyHeader', type: 'boolean', description: 'Header rows stick to the scroll region. Pair with maxHeight.' },
        { name: 'maxHeight', type: 'CSS length', description: 'Caps the region height and scrolls it vertically.' },
        { name: 'loading / loadingRows', type: 'boolean · number', default: 'false · 5', description: 'Skeleton rows, aria-busy on the table and a polite "Loading" announcement.' },
        { name: 'emptyState', type: 'ReactNode', default: "'No results'", description: 'Shown across all columns when there are no rows. A string becomes the heading (h3) of a compact EmptyState; pass an <EmptyState> for a preset, actions or another heading level.' },
        { name: 'manual / rowCount', type: 'boolean · number', description: 'Server-side mode: no client sorting, filtering or paging. rowCount is the total on the server.' },
        { name: 'toolbar', type: 'ReactNode', description: 'Extra toolbar content, such as bulk actions.' },
        { name: 'tableProps', type: 'TableProps', description: 'Passed to the inner Table: striped, hover, bordered, variant, color.' },
        { name: 'labels', type: 'Partial<DataTableLabels>', description: 'Every text and announcement, for translation: search, columns, selectAll, selectRow(), rowsPerPage, range(), sorted(), results(), selected() and more.' },
      ],
    },
    {
      title: 'DataTableColumn<Row>',
      props: [
        { name: 'key', type: 'string', description: 'Unique id. Without accessor, also the row property read.' },
        { name: 'header', type: 'ReactNode', description: 'Header content.' },
        { name: 'label', type: 'string', description: 'Plain-text name for announcements and the Columns menu when header is not text.' },
        { name: 'accessor', type: '(row) => unknown', default: 'row[key]', description: 'Value for sorting, search and filters, and the cell text without cell.' },
        { name: 'cell', type: '(row, index) => ReactNode', description: 'Custom cell content.' },
        { name: 'sortable / sortFn', type: 'boolean · (a, b) => number', description: 'Sort button in the header. The default comparison handles numbers, dates and text with numeric collation, empty values last.' },
        { name: 'align', type: "'start' | 'center' | 'end'", description: 'Text alignment of the header and cells (logical, so it flips in RTL).' },
        { name: 'width', type: 'CSS width', description: 'Column width.' },
        { name: 'hideable', type: 'boolean', description: 'Listed in the Columns menu.' },
        { name: 'filterable / filter', type: 'boolean · (row, query) => boolean', description: 'A labelled filter input under the header, with optional custom matching.' },
        { name: 'searchable', type: 'boolean', default: 'true', description: 'Included in the global search.' },
        { name: 'rowHeader', type: 'boolean', default: 'first visible column', description: 'Renders this column\'s cells as <th scope="row">.' },
      ],
    },
    {
      title: 'Table (additions)',
      props: [
        { name: 'stickyHeader', type: 'boolean', description: 'data-sticky-header: the thead sticks to the nearest scroll container.' },
        { name: 'density', type: "'compact' | 'default' | 'comfortable'", default: "'default'", description: 'data-density: cell padding.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab / Shift + Tab', action: 'Moves through the search, Columns button, scroll region, sort buttons, filters, checkboxes and pagination in reading order.' },
    { keys: 'Enter / Space', action: 'On a sort button: cycles ascending, descending, unsorted. On a checkbox: toggles it.' },
    { keys: 'Shift + Enter', action: 'With multiSort: adds the column to the sort instead of replacing it (Shift + click with a pointer).' },
    { keys: 'Arrow keys', action: 'On the focused scroll region: scrolls a wide or tall table.' },
    { keys: 'Enter / Space / ArrowDown', action: 'On Columns: opens the menu. ArrowUp/ArrowDown move, Enter or Space toggles a column, Escape closes and returns focus.' },
  ],
  screenReader: [
    'It is a real <table> with <caption>, column headers and a row header per row, so table navigation commands (Ctrl + Alt + arrows, T) work. It is not an ARIA grid, so there is no single tab stop to learn.',
    'The sorted column\'s header has aria-sort; other sortable headers have aria-sort="none". With several sorts, aria-sort stays on the most significant one and the order is announced.',
    'Announced politely through useAnnouncer: "Sorted by Name, ascending", "12 results" after typing pauses (in manual mode after loading ends), "3 rows selected" and "Loading".',
    'Every row checkbox has a name ("Select Ada Lovelace"); select all is "Select all rows" and reports mixed when some are selected.',
    'The scroll region is named by the caption, the search is "Search <caption>" and the pagination landmark is "<caption> pagination".',
  ],
  dos: [
    'Write a caption that names the data. Hide it visually with hideCaption if a heading above already says the same.',
    'Use getRowLabel when the row header is not a good name, such as an id.',
    'Use manual with rowCount when the data lives on a server, and show loading while you fetch.',
    'Keep cell content short; put long text, actions and forms in a detail view.',
  ],
  donts: [
    "Don't put the table in a Field. The caption is its label.",
    "Don't make whole rows clickable without a real link or button inside them; keyboard and screen reader users can't find the action.",
    "Don't rely on stickyHeader without maxHeight inside other scrolling containers: the header sticks to the nearest scroller.",
    "Don't hide every column that identifies a row.",
  ],
  a11y: [
    'Native table semantics, built on Table: caption, th scope="col" and th scope="row".',
    'Sort controls are buttons inside the headers with aria-sort on the th, at least 44px tall. Selected rows get a tint and a leading bar, so selection never relies on color alone.',
    'Status changes (sort, result counts, selection, loading) use the shared announcer, never moving focus (WCAG 4.1.3).',
    'The scroll region is focusable and named, so keyboard users can scroll it (WCAG 2.1.1). Checkbox targets are 44 × 44px in every density.',
    'Logical properties throughout, so alignment, the selection bar and the checkbox flip in RTL. SSR safe: nothing reads window or document during render.',
  ],
  classes: `.os-data-table[data-density][data-loading][data-disabled][data-readonly][data-invalid]
  > .os-data-table__toolbar > .os-data-table__search + .os-data-table__columns
  > .os-data-table__scroll[role="region"][data-scroll-y] > .os-table.os-data-table__table[data-density][data-sticky-header]
      th[aria-sort] > .os-data-table__sort[data-state="ascending|descending"] > .os-data-table__sort-label + .os-data-table__sort-icon + .os-data-table__sort-priority
      tr.os-data-table__filters · tr[data-selected] · .os-data-table__select · .os-data-table__empty
  > .os-data-table__footer > .os-data-table__page-size + .os-data-table__range + .os-pagination`,
};

export default doc;

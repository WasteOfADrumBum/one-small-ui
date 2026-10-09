import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tables',
  order: 30,
  name: 'Tables',
  group: 'Content',
  summary: 'Data tables with theme colors, stripes, hover and active states, borders, compact and card styles, captions, footers, row-group dividers, nesting, stacked mobile layout and a keyboard-scrollable wrapper. Use the Table component or the .os-table class with data attributes.',
  importLine: "import { Table } from 'onesmallui';",
  examples: [
    {
      name: 'table-basic',
      title: 'Basic table with caption and footer',
    },
    {
      name: 'table-colors',
      title: 'Theme colors',
      description: 'On the table, a tbody, a row or a cell.',
    },
    {
      name: 'table-states',
      title: 'Striped rows or columns, hover and active',
    },
    {
      name: 'table-borders',
      title: 'Bordered, borderless, compact and card',
    },
    {
      name: 'table-structure',
      title: 'Bottom captions, group dividers, vertical alignment and nesting',
      description: 'Plain HTML with data attributes.',
    },
    {
      name: 'table-stacked',
      title: 'Stacked on small screens',
    },
    {
      name: 'table-responsive',
      title: 'Responsive horizontal scrolling',
    },
  ],
  props: [
    {
      title: 'Table',
      props: [
        { name: 'caption', type: 'ReactNode', description: 'Visible title and accessible name.' },
        { name: 'captionSide', type: "'top' | 'bottom'", default: "'top'", description: 'Where the caption sits.' },
        { name: 'striped', type: "boolean | 'rows' | 'columns'", description: 'Zebra stripes.' },
        { name: 'hover', type: 'boolean', description: 'Row hover tint.' },
        { name: 'bordered', type: 'boolean', description: 'Borders on all cells.' },
        { name: 'borderless', type: 'boolean', description: 'No borders.' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Compact cells.' },
        { name: 'variant', type: "'default' | 'card'", default: "'default'", description: 'Card-like frame.' },
        { name: 'color', type: "'primary' | … | 'inverse'", description: 'Tint the whole table. Rows and cells take data-color.' },
        { name: 'stacked', type: "boolean | 'sm' | 'md' | 'lg'", description: 'Stack rows as cards below this breakpoint (true = md).' },
        { name: 'responsive', type: 'boolean', description: 'Wrap in a focusable horizontal scroll region.' },
        { name: 'regionLabel', type: 'string', description: 'Name for the scroll region when there is no caption.' },
      ],
    },
  ],
  reference: [
    {
      title: 'Table classes and attributes',
      columns: ['Selector', 'Effect'],
      rows: [
        ['.os-table', 'Base table: full width, padded cells, row rules, tabular numbers.'],
        ['[data-color="<color>"]', 'Soft tint on the table, a tbody, a tr or a td/th. Text stays 7:1.'],
        ['[data-striped="rows" | "columns"]', 'Zebra stripes.'],
        ['[data-hover]', 'Tint the row under the pointer.'],
        [
          'tr/td[data-state="active"]',
          'Highlight; active rows also get a leading bar so the state is not color alone.',
        ],
        ['[data-bordered] / [data-borderless]', 'Borders on every cell / none.'],
        ['[data-size="sm"]', 'Compact padding and smaller text.'],
        ['[data-variant="card"]', 'Rounded, framed surface.'],
        ['[data-caption="bottom"]', 'Caption below the table (top by default).'],
        ['tbody[data-divider]', 'Thicker rule above a row group.'],
        [
          '[data-stacked="sm" | "md" | "lg"]',
          'Rows become cards below that breakpoint; cells show their data-label.',
        ],
        [
          '.os-table-responsive',
          'Horizontal scroll wrapper (give it tabindex="0", role="region" and a name).',
        ],
        ['.os-align-top / middle / bottom', 'Vertical alignment on the table, a row or a cell.'],
      ],
    },
  ],
  a11y: [
    "Give every table a <caption> (the caption prop): it is the table's accessible name. Hide it with .os-sr-only if it must not show.",
    'Use <th scope="col"> for column headers and <th scope="row"> for row headers so each cell is announced with its headers.',
    'With responsive, the scroll wrapper is a focusable region named by the caption, so keyboard users can scroll it (WCAG 2.1.1).',
    'Stacked tables keep the header row in the accessibility tree, fill data-label from it, and pin ARIA table roles because some browsers drop table semantics when display changes. The visible labels are hidden from screen readers to avoid double reading.',
    'Stripes, hover and active tints keep body text at 7:1; active rows add a leading bar so the state is not conveyed by color alone (1.4.1).',
  ],
};

export default doc;

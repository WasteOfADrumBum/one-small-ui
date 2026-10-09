import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'pagination',
  order: 70,
  name: 'Pagination',
  group: 'Navigation',
  summary:
    'Page navigation with numbered pages, automatic ellipses, previous/next and first/last controls, three styles, three sizes and start/center/end alignment. Works with buttons (onPageChange) or links (getHref).',
  importLine: "import { Pagination, getPaginationRange } from 'onesmallui';",
  examples: [
    { name: 'pagination-basic', title: 'Buttons, ellipses and first / last' },
    { name: 'pagination-variants', title: 'Variants, sizes and alignment' },
    { name: 'pagination-links', title: 'Link mode', description: 'Pass `getHref` to render real links. `onPageChange` still fires on click.' },
  ],
  props: [
    {
      title: 'Pagination',
      props: [
        { name: 'count', type: 'number', description: 'Required. Total pages.' },
        { name: 'page / defaultPage', type: 'number', default: '1', description: 'Current page (1-based), controlled or initial.' },
        { name: 'onPageChange', type: '(page: number) => void', description: 'Called with the new page.' },
        { name: 'getHref', type: '(page: number) => string', description: 'Link mode: pages render as <a href>.' },
        { name: 'siblingCount', type: 'number', default: '1', description: 'Pages shown either side of the current one.' },
        { name: 'boundaryCount', type: 'number', default: '1', description: 'Pages always shown at each end.' },
        { name: 'showPrevNext', type: 'boolean', default: 'true', description: 'Previous / next controls.' },
        { name: 'showFirstLast', type: 'boolean', default: 'false', description: 'First / last controls.' },
        { name: 'variant', type: "'outline' | 'soft' | 'ghost'", default: "'outline'", description: 'Style.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size (targets stay 44px).' },
        { name: 'color', type: status, default: "'primary'", description: 'Color of the current page.' },
        { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Horizontal alignment.' },
        { name: 'aria-label', type: 'string', default: "'Pagination'", description: 'Names the navigation landmark.' },
        { name: 'labels', type: '{ page?, previous?, next?, first?, last? }', description: 'Accessible names, for translation.' },
      ],
    },
    {
      title: 'getPaginationRange(page, count, siblingCount?, boundaryCount?)',
      props: [{ name: 'returns', type: "(number | 'ellipsis-start' | 'ellipsis-end')[]", description: 'The page items to render, for custom pagination UIs.' }],
    },
  ],
  a11y: [
    'A nav landmark with a list; give each pagination on a page a distinct aria-label.',
    'The current page has aria-current="page". Every control has a full accessible name ("Page 4", "Next page") that starts with or contains its visible text.',
    'Unavailable previous/next are disabled buttons, or links without href and aria-disabled="true" in link mode.',
    'Ellipses are decorative and hidden from assistive tech. Arrow icons flip in right-to-left text.',
    'Every control is at least 44×44px (the small size extends its hit area).',
  ],
  classes:
    '.os-pagination[data-variant][data-size][data-color][data-align] > .os-pagination__list > li > .os-pagination__link[data-kind][aria-current] | .os-pagination__ellipsis',
};

export default doc;

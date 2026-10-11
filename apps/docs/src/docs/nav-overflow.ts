import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'nav-overflow',
  order: 61,
  name: 'Nav overflow',
  group: 'Navigation',
  summary:
    'Nav items that do not fit move into a "More" menu, measured with ResizeObserver. Works with tabs, underline, pills and inside a Navbar; keeps the active item visible; supports a minimum visible count, collapsing everything and a custom toggle.',
  importLine: "import { Nav, NavItem } from 'onesmallui';",
  examples: [
    { name: 'nav-overflow-basic', title: 'Tabs and underline', description: 'The active item is swapped in so it always stays visible.' },
    { name: 'nav-overflow-options', title: 'Minimum visible, custom toggle, collapse all' },
  ],
  props: [
    {
      title: 'Nav (overflow props)',
      props: [
        { name: 'overflow', type: 'boolean', description: 'Move items that do not fit into a menu (horizontal navs).' },
        { name: 'minVisible', type: 'number', default: '0', description: 'Always keep at least this many items in the row.' },
        { name: 'collapse', type: 'boolean', description: 'Put every item in the menu.' },
        { name: 'overflowLabel', type: 'ReactNode', default: "'More'", description: 'Toggle text (null for icon only).' },
        { name: 'overflowIcon', type: 'ReactNode', description: 'Toggle icon.' },
        { name: 'overflowAriaLabel', type: 'string', description: 'Accessible name when the toggle has no text.' },
      ],
    },
  ],
  a11y: [
    'The "More" toggle is a menu button; hidden items become menu items (links stay links) with their active state as aria-current.',
    'Items are measured in an inert, aria-hidden copy, so screen readers never hear duplicates.',
    'Give an icon-only toggle an overflowAriaLabel.',
  ],
  classes: `nav.os-nav[data-overflow] > ul.os-nav__list > li.os-nav__item.os-nav__more
nav.os-nav > ul.os-nav__measure[aria-hidden][inert]`,
};

export default doc;

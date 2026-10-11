import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'nav',
  order: 60,
  name: 'Nav',
  group: 'Navigation',
  summary:
    'Navigation links styled as plain links, tabs, pills or underline. Horizontal or vertical, start/center/end aligned, filled or justified, with active and disabled links and embedded dropdown menus.',
  importLine: "import { Nav, NavItem, NavMenu } from 'onesmallui';",
  examples: [
    { name: 'nav-basic', title: 'Links, tabs, pills and underline', description: 'The active link gets aria-current="page"; disabled links are not focusable.' },
    { name: 'nav-layout', title: 'Alignment, fill, justify and vertical' },
    { name: 'nav-menu', title: 'Embedded menus' },
  ],
  props: [
    {
      title: 'Nav',
      props: [
        { name: 'variant', type: "'links' | 'tabs' | 'pills' | 'underline'", default: "'links'", description: 'Visual style.' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical by default inside a collapsed Navbar.' },
        { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Horizontal alignment.' },
        { name: 'fill / justified', type: 'boolean', description: 'Grow items to fill the row (proportional / equal width).' },
        { name: 'as', type: "'nav' | 'div'", default: "'nav'", description: "nav is a landmark (give it aria-label); use 'div' inside a Navbar." },
        { name: 'overflow, minVisible, collapse, overflowLabel, overflowIcon', type: '…', description: 'See Nav overflow.' },
      ],
    },
    {
      title: 'NavItem',
      props: [
        { name: 'href', type: 'string', description: 'Link target; without it a button is rendered.' },
        { name: 'active', type: 'boolean', description: 'Sets aria-current and the active style.' },
        { name: 'current', type: "'page' | 'location' | 'step' | 'true'", default: "'page'", description: 'aria-current value when active.' },
        { name: 'disabled', type: 'boolean', description: 'Renders a non-focusable link with aria-disabled.' },
        { name: 'icon', type: 'ReactNode', description: 'Leading icon.' },
      ],
    },
    {
      title: 'NavMenu',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Trigger text.' },
        { name: 'children', type: 'Menu items', description: 'MenuItem, MenuGroup, MenuDivider…' },
        { name: 'active', type: 'boolean', description: 'Highlight when the current page is inside.' },
        { name: 'placement / appearance', type: 'as Menu', description: 'Passed to the menu.' },
      ],
    },
  ],
  a11y: [
    'Renders a <nav> landmark with a list of links; give each nav a unique aria-label.',
    'The current link has aria-current="page" (or location/step), not just a color change: tabs get a border, links an underline, pills a fill.',
    'Disabled links have no href and aria-disabled="true", so they are skipped by Tab.',
    'Nav tabs are for navigation between pages. For in-page panels use Tabs, which implements the ARIA tabs pattern.',
    'NavMenu is a menu button (see Menu) inside the list.',
  ],
  classes: `nav.os-nav[data-variant][data-orientation][data-align][data-fill][data-justified]
  > ul.os-nav__list > li.os-nav__item > .os-nav__link[aria-current][data-active][data-disabled]`,
};

export default doc;

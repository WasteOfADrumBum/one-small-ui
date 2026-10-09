import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'list-group',
  order: 40,
  name: 'List Group',
  group: 'Data display',
  summary:
    'A flexible list of items, links or buttons with active and disabled states, flush, numbered and responsive horizontal layouts, theme colors, badges, form controls, and tab control.',
  importLine: "import { ListGroup, ListGroupItem } from 'onesmallui';",
  examples: [
    { name: 'list-group-basic', title: 'Static items, links and buttons', description: 'Pass `href` for a link or `onClick` for a button. Active items get `aria-current`.' },
    { name: 'list-group-variants', title: 'Flush, numbered, colors and horizontal' },
    { name: 'list-group-content', title: 'Badges, custom content, checkboxes and radios' },
    {
      name: 'list-group-tabs',
      title: 'Controlling tab content',
      description: 'Add `os-list-group` to a vertical `TabList` and `os-list-group__item` to each `Tab`: list-group looks with the full tabs keyboard pattern.',
    },
  ],
  props: [
    {
      title: 'ListGroup',
      props: [
        { name: 'flush', type: 'boolean', description: 'No outer border or radius (inside cards).' },
        { name: 'numbered', type: 'boolean', description: 'Renders an <ol> with numbers.' },
        { name: 'horizontal', type: "boolean | 'sm' | 'md' | 'lg' | 'xl'", description: 'Row layout, always or from a breakpoint up.' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Padding and text size (items stay 44px tall).' },
      ],
    },
    {
      title: 'ListGroupItem',
      props: [
        { name: 'href', type: 'string', description: 'Renders a link filling the row.' },
        { name: 'onClick', type: 'MouseEventHandler', description: 'Renders a button filling the row.' },
        { name: 'active', type: 'boolean', description: 'Highlights the item and sets aria-current.' },
        { name: 'current', type: "'true' | 'page' | 'step' | 'location'", default: "'true'", description: 'aria-current value when active.' },
        { name: 'disabled', type: 'boolean', description: 'Disabled button, or a link without href and aria-disabled.' },
        { name: 'color', type: status, description: 'Theme color.' },
        { name: 'end', type: 'ReactNode', description: 'Trailing content such as a badge.' },
        { name: 'actionProps', type: 'Anchor & Button attributes', description: 'Extra props for the inner link or button.' },
      ],
    },
  ],
  a11y: [
    'Always a real <ul>/<ol> with <li> items, so screen readers announce the count; links and buttons sit inside the items.',
    'Name lists with aria-label when the purpose is not clear from a nearby heading; wrap navigation lists in a <nav>.',
    'Active links use aria-current (pass current="page" for navigation); active state is not shown by color alone thanks to a filled background.',
    'Rows with checkboxes or radios use the real inputs and labels; group radios in a fieldset with a legend.',
    'Every row is at least 44px tall.',
  ],
  classes:
    '.os-list-group[data-flush][data-numbered][data-horizontal][data-size] > .os-list-group__item[data-active][data-disabled][data-color][data-actionable] > .os-list-group__action > .os-list-group__content + .os-list-group__end',
};

export default doc;

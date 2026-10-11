import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'navbar',
  order: 62,
  name: 'Navbar',
  group: 'Navigation',
  summary:
    'A responsive header: brand text or logo, navigation, forms and text. Below a breakpoint the content collapses into a Drawer behind a toggle button, which can also be controlled from outside. Static, sticky or fixed placement; dark, themed and translucent appearances.',
  importLine: "import { Navbar, NavbarText, Nav, NavItem } from 'onesmallui';",
  examples: [
    { name: 'navbar-basic', title: 'Brand, links, search and text', description: 'Resize below 1024px to see the drawer.' },
    { name: 'navbar-appearance', title: 'Dark, themed, translucent, logo and always collapsed' },
    { name: 'navbar-placement', title: 'Placement and external control' },
  ],
  props: [
    {
      title: 'Navbar',
      props: [
        { name: 'brand', type: 'ReactNode', description: 'Text or logo.' },
        { name: 'brandHref', type: 'string | null', default: "'/'", description: 'Brand link; null for plain text.' },
        { name: 'expand', type: "'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'always' | 'never'", default: "'lg'", description: 'Width from which content shows inline.' },
        { name: 'placement', type: "'static' | 'sticky-top' | 'fixed-top' | 'fixed-bottom'", default: "'static'", description: 'Positioning.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Bar style (the drawer follows).' },
        { name: 'color', type: status, description: 'Fill with a theme color.' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Drawer state, controllable from outside.' },
        { name: 'actions', type: 'ReactNode', description: 'Always-visible content at the end.' },
        { name: 'toggleLabel', type: 'string', default: "'Open navigation'", description: 'Toggle button label.' },
        { name: 'drawerTitle / drawerPlacement', type: 'ReactNode / DrawerPlacement', default: "'Menu' / 'end'", description: 'Mobile drawer.' },
        { name: 'closeOnNavigate', type: 'boolean', default: 'true', description: 'Close the drawer when a link is followed.' },
      ],
    },
  ],
  a11y: [
    'Renders a <nav> landmark: give it an aria-label and use <Nav as="div"> inside.',
    'The toggle is a 44px button with aria-label, aria-expanded and aria-controls; the drawer traps focus and returns it to the toggle.',
    'Themed bars use the on-<color> token for text and the focus ring; the current page is underlined, not only colored.',
  ],
  classes: `nav.os-navbar[data-placement][data-color][data-expanded][data-os-theme][data-appearance]
  > .os-navbar__inner > .os-navbar__brand + .os-navbar__content + .os-navbar__actions + .os-navbar__toggle
  dialog.os-drawer.os-navbar__drawer  .os-navbar__text`,
};

export default doc;

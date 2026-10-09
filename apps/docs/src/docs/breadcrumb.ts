import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'breadcrumb',
  order: 60,
  name: 'Breadcrumb',
  group: 'Navigation',
  summary: 'Shows where the current page sits in the site hierarchy, with chevron, slash, dot, arrow, text or SVG dividers.',
  importLine: "import { Breadcrumb, BreadcrumbItem } from 'onesmallui';",
  examples: [
    { name: 'breadcrumb-basic', title: 'Page hierarchy and current page' },
    { name: 'breadcrumb-separators', title: 'Dividers', description: 'Built-in `chevron`, `slash`, `dot` and `arrow`, or any text or node.' },
  ],
  props: [
    {
      title: 'Breadcrumb',
      props: [
        { name: 'separator', type: "'chevron' | 'slash' | 'dot' | 'arrow' | ReactNode", default: "'chevron'", description: 'Divider between items. Chevron and arrow flip in RTL.' },
        { name: 'aria-label', type: 'string', default: "'Breadcrumb'", description: 'Names the navigation landmark.' },
      ],
    },
    {
      title: 'BreadcrumbItem',
      props: [
        { name: 'href', type: 'string', description: 'Link to the ancestor page.' },
        { name: 'current', type: 'boolean', description: 'The current page: plain text with aria-current="page".' },
        { name: 'icon', type: 'ReactNode', description: 'Leading decorative icon.' },
        { name: 'linkProps', type: 'AnchorHTMLAttributes', description: 'Extra props for the link (e.g. for a router).' },
      ],
    },
  ],
  a11y: [
    'Rendered as nav > ol, so screen readers announce a navigation landmark and the number of levels.',
    'The current page has aria-current="page" and is not a link.',
    'Dividers are aria-hidden, so they are not read between items.',
    'Links are at least 44px tall and underlined, so they are not identified by color alone.',
  ],
  classes:
    '.os-breadcrumb[data-separator] > .os-breadcrumb__list > .os-breadcrumb__item[data-current] > .os-breadcrumb__separator + .os-breadcrumb__link | .os-breadcrumb__page',
};

export default doc;

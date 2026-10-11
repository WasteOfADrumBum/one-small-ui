import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'scrollspy',
  order: 90,
  name: 'ScrollSpy',
  group: 'Navigation',
  summary:
    'Highlights navigation links as their sections scroll into view, using IntersectionObserver. Works with Nav, Navbar, nested lists, list groups and plain anchors; in the page or a custom scroll container; with a configurable activation line and a debug overlay. Also available as a useScrollSpy hook.',
  importLine: "import { ScrollSpy, useScrollSpy } from 'onesmallui';",
  examples: [
    { name: 'scrollspy-basic', title: 'Custom container with a Nav and debug line' },
    { name: 'scrollspy-nested', title: 'Nested links on the page, and the hook' },
  ],
  props: [
    {
      title: 'ScrollSpy',
      props: [
        { name: 'root', type: 'HTMLElement | RefObject | null', default: 'viewport', description: 'Scroll container.' },
        { name: 'offset', type: 'number | string', default: "'30%'", description: 'Activation line from the top of the root: px or a percentage.' },
        { name: 'rootMargin', type: 'string', description: 'Full IntersectionObserver rootMargin override.' },
        { name: 'debug', type: 'boolean', description: 'Draw the activation line.' },
        { name: 'handleClicks', type: 'boolean', default: 'true', description: 'Smooth-scroll to sections on click without changing the URL hash, and move focus to them.' },
        { name: 'onActiveChange', type: '(id | null) => void', description: 'Called when the active section changes.' },
        { name: 'enabled', type: 'boolean', default: 'true', description: 'Pause spying.' },
      ],
    },
    {
      title: 'useScrollSpy(ids, options)',
      props: [{ name: 'returns', type: 'string | null', description: 'The id of the section crossing the activation line. Options: root, offset, rootMargin, enabled.' }],
    },
  ],
  a11y: [
    'The active link gets aria-current="location" plus data-active; parents of nested links get data-active="parent" only.',
    'Clicked links move focus to the target section (tabindex="-1" is added if needed), so keyboard users land where they read.',
    'Smooth scrolling turns off for people who prefer reduced motion.',
    'Custom scroll containers need tabindex="0" and a label so keyboard users can scroll them.',
  ],
  classes: `.os-scrollspy a[aria-current=location][data-active]
.os-scrollspy a[data-active=parent]
.os-scrollspy__debug`,
};

export default doc;

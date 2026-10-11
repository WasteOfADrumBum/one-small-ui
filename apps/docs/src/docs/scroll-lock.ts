import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'scroll-lock',
  order: 30,
  name: 'Scroll lock',
  group: 'Accessibility',
  summary:
    'useScrollLock stops the page scrolling behind an overlay without the layout jumping sideways. Locks are counted, so nested overlays unlock the page only when the last one closes. Works on iOS Safari.',
  importLine: "import { useScrollLock } from '@onesmall/ui';",
  examples: [{ name: 'scroll-lock-basic', title: 'Locking the page' }],
  props: [
    {
      title: 'useScrollLock(active)',
      props: [{ name: 'active', type: 'boolean', description: 'Lock while true. Unlocks on false or unmount.' }],
    },
  ],
  reference: [
    {
      title: 'What it sets while locked',
      columns: ['Selector or property', 'Purpose'],
      rows: [
        ['html.os-scroll-locked', 'overflow: hidden on the page.'],
        ['--os-scrollbar-width', 'The removed scrollbar width, on <html>. Fixed elements (navbars, the toast viewport) pad by it to stay put.'],
        ['body padding-inline-end', 'Increased by the scrollbar width, so content does not shift.'],
        ['body position: fixed', 'iOS Safari only, where overflow on the root is ignored. Scroll position is restored on unlock.'],
      ],
    },
  ],
  keyboard: [
    {
      keys: 'None',
      action: 'Adds no keys of its own. Page keys (Space, Page Down, arrows) stop scrolling the page behind, but still scroll the overlay.',
    },
  ],
  screenReader: [
    'Scroll lock is visual only: screen readers can still read the page behind. Pair it with a focus trap and make the background inert, or use Dialog.',
  ],
  dos: [
    'Lock only while a modal overlay covers the page.',
    'Use the --os-scrollbar-width property on your own fixed elements so they do not jump.',
  ],
  donts: [
    "Don't lock for non-modal popups, menus or tooltips: the page should still scroll.",
    "Don't set overflow: hidden on <body> yourself alongside it; the counts and padding will disagree.",
  ],
  a11y: [
    'No layout shift when the scrollbar disappears, so zoomed-in users keep their place.',
    'Dialog (modal) and Drawer lock scroll for you; their scrollLock prop turns it off.',
    'SSR safe.',
  ],
};

export default doc;

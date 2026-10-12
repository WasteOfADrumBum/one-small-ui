import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'hooks',
  order: 200,
  name: 'Hooks',
  group: 'Theming',
  summary:
    'Utility hooks the components are built on. No Redux, no global store. Accessibility hooks have their own pages: Focus trap, Focus return, Scroll lock, Reduced motion and Announcer; Transition covers useTransition.',
  importLine: "import { useBreakpoint, useMediaQuery, usePrefersReducedMotion, useDisclosure, useCopyToClipboard, useControllableState, useDropZone } from '@onesmall/ui';",
  examples: [{ name: 'hooks-basic', title: 'Responsive and preference hooks' }],
  props: [
    {
      title: 'Hooks',
      props: [
        { name: 'useBreakpoint(bp)', type: 'boolean', description: 'True at or above sm | md | lg | xl | 2xl | 3xl.' },
        { name: 'useMediaQuery(query)', type: 'boolean', description: 'Any media query; SSR-safe.' },
        { name: 'usePrefersReducedMotion()', type: 'boolean', description: 'OS reduced-motion setting. Also named useReducedMotion().' },
        { name: 'useDisclosure(initial?)', type: '{ isOpen, open, close, toggle }', description: 'Open state for overlays.' },
        { name: 'useCopyToClipboard(ms?)', type: '{ copy, copied }', description: 'Clipboard with fallback.' },
        { name: 'useControllableState(v, d, cb)', type: '[value, setValue]', description: 'Controlled/uncontrolled props.' },
        { name: 'useFocusTrap(ref, options?)', type: 'void', description: 'Keep Tab inside an element. See Focus trap.' },
        { name: 'useFocusReturn(options)', type: '{ restore }', description: 'Give focus back on close. See Focus return.' },
        { name: 'useScrollLock(active)', type: 'void', description: 'Lock page scroll without layout shift. See Scroll lock.' },
        { name: 'useAnnouncer()', type: '{ announce }', description: 'Read a message to screen readers. See Announcer.' },
        { name: 'useTransition(show, options?)', type: '{ state, mounted, duration }', description: 'Enter/exit phases. See Transition.' },
      ],
    },
  ],
  a11y: [],
};

export default doc;

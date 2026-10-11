import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'hooks',
  order: 200,
  name: 'Hooks',
  group: 'Theming',
  summary: 'Utility hooks the components are built on. No Redux, no global store.',
  importLine: "import { useBreakpoint, useMediaQuery, usePrefersReducedMotion, useDisclosure, useCopyToClipboard, useControllableState, useDropZone } from 'onesmallui';",
  examples: [{ name: 'hooks-basic', title: 'Responsive and preference hooks' }],
  props: [
    {
      title: 'Hooks',
      props: [
        { name: 'useBreakpoint(bp)', type: 'boolean', description: 'True at or above sm | md | lg | xl | 2xl | 3xl.' },
        { name: 'useMediaQuery(query)', type: 'boolean', description: 'Any media query; SSR-safe.' },
        { name: 'usePrefersReducedMotion()', type: 'boolean', description: 'OS reduced-motion setting.' },
        { name: 'useDisclosure(initial?)', type: '{ isOpen, open, close, toggle }', description: 'Open state for overlays.' },
        { name: 'useCopyToClipboard(ms?)', type: '{ copy, copied }', description: 'Clipboard with fallback.' },
        { name: 'useControllableState(v, d, cb)', type: '[value, setValue]', description: 'Controlled/uncontrolled props.' },
      ],
    },
  ],
  a11y: [],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'reduced-motion',
  order: 40,
  name: 'Reduced motion',
  group: 'Accessibility',
  summary:
    'useReducedMotion is true when the user has asked their system to reduce motion. Library CSS already honours it; use the hook for motion you start from JavaScript, such as smooth scrolling or canvas animation.',
  importLine: "import { useReducedMotion } from '@onesmall/ui';",
  examples: [
    {
      name: 'reduced-motion-basic',
      title: 'Smooth scrolling only when motion is welcome',
      description: 'Turn on Reduce motion in your OS settings and the badge flips with no reload.',
    },
  ],
  props: [
    {
      title: 'useReducedMotion()',
      props: [
        {
          name: 'returns',
          type: 'boolean',
          description: 'true when (prefers-reduced-motion: reduce) matches. false on the server. Updates live. usePrefersReducedMotion() is the same hook under its older name.',
        },
      ],
    },
  ],
  keyboard: [{ keys: 'None', action: 'Adds no keys of its own.' }],
  screenReader: [
    'Nothing is announced. The hook only changes how things move, never what is shown.',
  ],
  dos: [
    'Replace movement with an instant change or a short fade, and keep the end state the same.',
    'Use it for scrollIntoView, scrollTo, canvas or Web Animations API code.',
    'Use Transition or useTransition for show and hide: they switch to instant under reduced motion for you.',
  ],
  donts: [
    "Don't hide content or features when motion is reduced.",
    "Don't use it to reimplement what CSS already does: every component animates through tokens that collapse under reduced motion.",
  ],
  a11y: [
    'Supports WCAG 2.3.3 Animation from Interactions (AAA).',
    'For the CSS side (data-os-motion and the duration tokens), see Motion & transitions.',
  ],
};

export default doc;

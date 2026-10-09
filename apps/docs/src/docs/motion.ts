import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'motion',
  order: 40,
  name: 'Motion & transitions',
  group: 'Framework',
  summary:
    'Every component animates through shared duration and easing tokens, so motion can be tuned, switched off per element, or disabled at build time. Reduced-motion preferences are honoured automatically.',
  examples: [{ name: 'motion-basic', title: 'Switching motion off for a subtree' }],
  snippets: [
    {
      title: 'Runtime switches',
      language: 'markup',
      code: `<html data-os-motion="off">   <!-- no transitions anywhere -->
<html data-os-motion="on">    <!-- animate even when the OS asks for reduced motion -->`,
    },
    {
      title: 'Tune or disable at build time',
      language: 'scss',
      code: `@use 'onesmallui/scss' with (
  $enable-transitions: false,          // render every component without motion
  $durations: ('fast': 80ms, 'base': 160ms, 'slow': 280ms, 'slower': 480ms),
);`,
    },
    {
      title: 'Per component',
      language: 'css',
      code: `/* Slow down just the accordions */
.os-accordion { --os-duration-slow: 600ms; }`,
    },
  ],
  a11y: [
    'prefers-reduced-motion: reduce collapses every duration to near zero (2.3.3 Animation from Interactions, AAA).',
    'Looping animations (spinners, shimmer) switch to a slow pulse or stop under reduced motion.',
  ],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'utilities-effects',
  order: 70,
  name: 'Interaction and effects',
  group: 'Utilities',
  summary: 'Opacity, shadows, pointer events, text selection, cursors, transitions and durations, and motion switches that honor reduced-motion preferences.',
  examples: [
    {
      name: 'effects-basic',
      title: 'Opacity, shadows, pointer events and selection',
    },
    {
      name: 'effects-motion',
      title: 'Motion',
    },
  ],
  reference: [
    {
      title: 'Effect classes',
      columns: ['Class', 'Effect'],
      rows: [
        ['.os-opacity-{0,5,10,25,50,75,90,100}', 'Opacity.'],
        ['.os-shadow, .os-shadow-{none,sm,md,lg,glow}', 'Shadow tokens.'],
        ['.os-pointer-events-{none,auto}', 'Pointer events.'],
        ['.os-select-{none,text,all,auto}', 'user-select.'],
        ['.os-cursor-{pointer,grab,default,text,move,help,not-allowed,wait}', 'Cursor.'],
        [
          '.os-transition, .os-transition-{all,colors,opacity,transform,none}',
          'Transitions on the motion tokens.',
        ],
        ['.os-duration-{fast,base,slow,slower}', 'Transition duration tokens.'],
        ['.os-motion-off', 'Collapse every duration in a subtree (like data-os-motion="off").'],
        [
          'motion-safe:os-hidden, motion-reduce:os-hidden',
          'Show alternative content depending on prefers-reduced-motion.',
        ],
        [
          'motion-reduce:os-transition-none, motion-reduce:os-animate-none',
          'Turn off a transition or animation for reduced motion.',
        ],
      ],
    },
  ],
  a11y: [
    'Low opacity lowers text contrast: never put text you need to read at reduced opacity.',
    '.os-pointer-events-none does not stop keyboard users; also remove the element from the tab order and set aria-disabled.',
    'Durations come from tokens that collapse for prefers-reduced-motion (2.3.3).',
  ],
};

export default doc;

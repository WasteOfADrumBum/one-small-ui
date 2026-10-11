import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'focus-return',
  order: 20,
  name: 'Focus return',
  group: 'Accessibility',
  summary:
    'useFocusReturn remembers what had focus when something opens and puts focus back when it closes, so keyboard users never get dropped at the top of the page. useFocusTrap uses it for you.',
  importLine: "import { useFocusReturn } from '@onesmall/ui';",
  examples: [
    {
      name: 'focus-return-basic',
      title: 'Returning focus after an inline confirmation',
      description: 'Press Delete log, then either button: the confirmation disappears and focus goes back to Delete log.',
    },
  ],
  props: [
    {
      title: 'useFocusReturn(options)',
      props: [
        { name: 'active', type: 'boolean', description: 'Saves the focused element when it turns true; restores focus when it turns false.' },
        { name: 'target', type: 'RefObject<HTMLElement | null>', description: 'Return focus here instead of the saved element.' },
        { name: 'fallback', type: 'RefObject<HTMLElement | null>', description: 'Used when the saved element is no longer in the page.' },
        {
          name: 'container',
          type: 'RefObject<HTMLElement | null>',
          description: 'The closing region. Focus only moves back if it was lost (on <body>) or is still inside it, so focus the user moved elsewhere is kept.',
        },
        { name: 'restoreOnDeactivate', type: 'boolean', default: 'true', description: 'false: call restore() yourself.' },
        { name: 'returns', type: '{ restore: () => boolean }', description: 'Move focus back now. True when an element received focus.' },
      ],
    },
  ],
  keyboard: [{ keys: 'None', action: 'Adds no keys of its own. It runs when your component opens and closes.' }],
  screenReader: [
    'Moving focus back means screen readers announce the trigger again, which confirms the action finished and where the user is.',
    'The restore is deferred by a microtask, so an overlay closing in the same render is gone (and no longer inert-ing the page) before focus moves.',
  ],
  dos: [
    'Pass container for anything that renders focusable content, so a user who clicked elsewhere keeps their focus.',
    'Give a fallback when the opener can disappear, for example a row button in a list the action removes.',
  ],
  donts: [
    "Don't add it to Dialog, Drawer, Menu or Popover: they return focus already.",
    "Don't send focus to <body> or the top of the page after closing something.",
  ],
  a11y: [
    'Meets WCAG 2.4.3 Focus Order for content that opens and closes.',
    'Never steals focus: it only acts when focus was lost or is still inside the closing region.',
    'SSR safe.',
  ],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'focus-trap',
  order: 10,
  name: 'Focus trap',
  group: 'Accessibility',
  summary:
    'useFocusTrap keeps Tab and Shift+Tab inside an element while it is active, moves focus in when it starts and gives it back when it ends. Use it for custom overlays and popups; Dialog and Drawer already trap focus.',
  importLine: "import { useFocusTrap } from '@onesmall/ui';",
  examples: [
    {
      name: 'focus-trap-basic',
      title: 'Trapping focus in a custom panel',
      description: 'Open the panel and press Tab: focus wraps from Cancel back to the input. Escape closes it.',
    },
  ],
  props: [
    {
      title: 'useFocusTrap(ref, options)',
      props: [
        { name: 'ref', type: 'RefObject<HTMLElement | null>', description: 'The element to keep focus inside.' },
        { name: 'active', type: 'boolean', default: 'true', description: 'Trap while true.' },
        {
          name: 'initialFocus',
          type: "RefObject<HTMLElement> | 'first' | 'container' | false",
          default: "'first'",
          description: "Where focus goes on activate. 'first' picks the [autofocus] element, else the first tabbable one, else the container. Nothing moves if focus is already inside.",
        },
        {
          name: 'returnFocus',
          type: 'boolean | RefObject<HTMLElement>',
          default: 'true',
          description: 'On deactivate, focus the element that had focus before, a given element, or nothing (false).',
        },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to the next focusable element; from the last one, wraps to the first.' },
    { keys: 'Shift + Tab', action: 'Moves to the previous focusable element; from the first one, wraps to the last.' },
    { keys: 'Escape', action: 'Nothing by default. Close your overlay yourself (the example does).' },
  ],
  screenReader: [
    'The trap only handles Tab. A screen reader virtual cursor can still read outside it, so for a real modal also make the rest of the page inert (or use Dialog, whose showModal() does).',
    'Give the trapped element a role and a name (role="dialog" with aria-labelledby, or role="group" with aria-label) so users know where they are.',
    'Focusables are looked up on every key press: content added later is included, and disabled, hidden and inert elements are skipped.',
  ],
  dos: [
    'Trap only while the overlay is open: pass active={open}.',
    'Close on Escape and give users a visible close or cancel button.',
    'Let nested traps stack: the newest one wins and the outer one resumes when it closes.',
  ],
  donts: [
    "Don't trap focus in inline page content. Users must be able to Tab away.",
    "Don't add your own trap to Dialog or Drawer; they already have one.",
    "Don't leave the trap with nothing focusable and no name: focus lands on the container, so label it.",
  ],
  a11y: [
    'Supports WCAG 2.1.2 No Keyboard Trap: the trap ends when the overlay closes, and Escape should close it.',
    'Focus returns to the opener on close (2.4.3 Focus Order) unless focus was already moved somewhere else.',
    'SSR safe: nothing runs until the effect mounts.',
  ],
};

export default doc;

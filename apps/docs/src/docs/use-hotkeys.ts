import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'use-hotkeys',
  order: 70,
  name: 'useHotkeys',
  group: 'Accessibility',
  summary:
    'Runs a handler when a keyboard shortcut is pressed. Mod is ⌘ on Apple platforms and Ctrl elsewhere. Typing in inputs, textareas and contenteditable is left alone unless you opt in.',
  importLine: "import { useHotkeys } from '@onesmall/ui';",
  examples: [
    { name: 'use-hotkeys-basic', title: 'A global shortcut', description: 'Press Mod+J anywhere on this page (outside a text field) to log a launch.' },
  ],
  props: [
    {
      title: 'useHotkeys(combo, handler, options)',
      props: [
        { name: 'combo', type: 'string | string[]', description: "One or more combos: 'Mod+K', ['Mod+K', '/']. Same syntax as Kbd." },
        { name: 'handler', type: '(event: KeyboardEvent) => void', description: 'Called on a match. Always the latest function, so no useCallback needed.' },
        { name: 'enabled', type: 'boolean', default: 'true', description: 'Listen while true.' },
        { name: 'preventDefault', type: 'boolean', default: 'true', description: "Stop the browser's own action for the combo (Ctrl+K focuses the address bar in some browsers)." },
        { name: 'allowInInputs', type: 'boolean', default: 'false', description: 'Also fire while focus is in a text field, select or contenteditable.' },
        { name: 'target', type: 'RefObject<HTMLElement>', description: 'Listen on this element instead of document.' },
        { name: 'event', type: "'keydown' | 'keyup'", default: "'keydown'", description: 'Which key event to listen to.' },
      ],
    },
  ],
  keyboard: [{ keys: 'Your combo', action: 'Runs the handler, unless focus is in a text field or an IME composition is in progress.' }],
  screenReader: [
    'Screen readers in browse mode capture many single keys. Prefer combos with a modifier for global shortcuts, and give every shortcut a visible control too.',
    'Set aria-keyshortcuts on the control that the shortcut triggers so assistive tech can announce it.',
  ],
  dos: [
    'Show the shortcut with Kbd next to the button or menu item that does the same thing.',
    'Disable shortcuts that conflict with an open overlay by passing enabled={!open}.',
  ],
  donts: [
    "Don't bind single character keys globally without a way to turn them off (WCAG 2.1.4 Character Key Shortcuts).",
    "Don't override well-known browser or screen reader shortcuts such as Ctrl+L, Ctrl+T or Insert.",
  ],
  a11y: [
    'WCAG 2.1.4: single-key shortcuts must be remappable, disableable or only active on focus; use enabled or target for that.',
    'Events from text fields are ignored by default so typing never triggers actions.',
    'SSR safe: the listener is added in an effect and removed on unmount.',
  ],
};

export default doc;

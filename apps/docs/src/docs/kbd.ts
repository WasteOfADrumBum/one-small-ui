import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'kbd',
  order: 20,
  name: 'Kbd',
  group: 'Content',
  summary:
    'Shows a keyboard key or shortcut on the semantic <kbd> element. Combos such as Mod+K show ⌘K on Apple platforms and Ctrl K elsewhere, and screen readers hear the keys spelled out.',
  importLine: "import { Kbd } from '@onesmall/ui';",
  examples: [
    { name: 'kbd-basic', title: 'Keys and combos', description: 'Mod becomes ⌘ on macOS and iOS, and Ctrl everywhere else.' },
    { name: 'kbd-sizes', title: 'Sizes and fixed platforms', description: 'Force a platform to document both, for example in a help page.' },
  ],
  props: [
    {
      title: 'Kbd',
      props: [
        {
          name: 'combo',
          type: 'string',
          description:
            "Keys joined by +: 'Mod+K', 'Shift+?', 'Ctrl+Alt+Delete'. Modifiers: Mod, Ctrl, Meta (Cmd), Alt (Option), Shift. Named keys: Enter, Esc, Tab, Space, Backspace, Delete, arrows, Home, End, PageUp, PageDown, F1 to F12. Without it, children render as one key.",
        },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font size of the key cap.' },
        {
          name: 'platform',
          type: "'auto' | 'mac' | 'other'",
          default: "'auto'",
          description: "Which labels to show. 'auto' renders the non-Apple form on the server and switches after hydration.",
        },
      ],
    },
    {
      title: 'Helpers',
      props: [
        { name: 'formatHotkey(combo, platform?)', type: '{ keys: string[]; spoken: string }', description: 'The labels and the spoken form, for your own markup or an aria-keyshortcuts value.' },
        { name: 'parseHotkey(combo)', type: 'ParsedHotkey', description: 'The modifiers and main key of a combo.' },
        { name: 'isApplePlatform()', type: 'boolean', description: 'macOS, iOS or iPadOS. False on the server.' },
      ],
    },
  ],
  screenReader: [
    'The visual key caps are aria-hidden. A visually hidden span reads the combo in words: "Control K", "Command Shift P", "Shift Question mark".',
    'The outer element is still a <kbd>, so the text keeps its meaning when read in browse mode.',
  ],
  dos: [
    'Use Kbd next to the control the shortcut triggers, in menus, tooltips and help pages.',
    'Write combos with Mod when the shortcut uses Command on Mac and Control elsewhere.',
    'Also set aria-keyshortcuts on the control that owns the shortcut.',
  ],
  donts: [
    "Don't use Kbd for things that aren't keys, such as code or button names.",
    "Don't rely on a shortcut as the only way to do something.",
  ],
  a11y: [
    'Spoken text avoids symbols like ⌘ and ⇧ that many screen readers skip or read inconsistently.',
    'Contrast: key text uses the text token on the surface token (7:1 or more in both themes).',
    'SSR safe: platform detection runs after hydration, so server and client markup match.',
  ],
  classes: '.os-kbd, .os-kbd__keys, .os-kbd__key; data-size, data-platform',
};

export default doc;

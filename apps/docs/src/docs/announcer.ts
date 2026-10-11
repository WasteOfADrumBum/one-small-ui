import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'announcer',
  order: 50,
  name: 'Announcer & live regions',
  group: 'Accessibility',
  summary:
    'Tell screen reader users about changes they cannot see: "Saved", "3 results", "Upload failed". useAnnouncer() reads a message from anywhere; LiveRegion is a live region you render yourself. Toasts are announced through the same announcer.',
  importLine: "import { AnnouncerProvider, useAnnouncer, LiveRegion } from '@onesmall/ui';",
  examples: [
    {
      name: 'announcer-basic',
      title: 'Announcing from code',
      description: 'Turn on a screen reader and press the buttons. The error interrupts; the save waits its turn.',
    },
    {
      name: 'announcer-live-region',
      title: 'A visible live region',
      description: 'The count is on screen for everyone and read aloud after each change.',
    },
  ],
  props: [
    {
      title: 'AnnouncerProvider',
      props: [
        { name: 'children', type: 'ReactNode', description: 'Your app. Mount it once near the root; it renders one polite and one assertive region.' },
      ],
    },
    {
      title: 'useAnnouncer()',
      props: [
        { name: 'returns', type: '{ announce(message, options?) }', description: 'Reads message aloud through the nearest provider, else a shared pair of regions added to <body> on first use.' },
        { name: 'options.politeness', type: "'polite' | 'assertive'", default: "'polite'", description: 'polite waits for the screen reader to finish; assertive interrupts. Use assertive for errors only.' },
      ],
    },
    {
      title: 'LiveRegion',
      props: [
        { name: 'politeness', type: "'polite' | 'assertive'", default: "'polite'", description: 'role="status" (polite) or role="alert" (assertive), with matching aria-live.' },
        { name: 'atomic', type: 'boolean', default: 'true', description: 'Read the whole region on every change, not just the changed part.' },
        { name: 'visible', type: 'boolean', default: 'false', description: 'Show it on screen. Otherwise it is visually hidden.' },
      ],
    },
  ],
  keyboard: [{ keys: 'None', action: 'Adds no keys of its own. Announcing never moves focus.' }],
  screenReader: [
    'Messages are cleared and rewritten after 100ms, so repeating the same message ("Copied", "Copied") is read again.',
    'The regions exist before anything is announced. Live regions added at the same moment as their text are often skipped, which is why a provider near the root is the most reliable setup.',
    'ToastProvider announces each toast through the announcer: polite, danger toasts assertive. It uses your AnnouncerProvider or mounts its own. Set announcement on a toast to change what is read.',
  ],
  dos: [
    'Announce the result of an action that changes nothing focused: saved, copied, filtered, added to cart.',
    'Keep messages short and say the outcome first.',
    'Use a visible LiveRegion when sighted users need the same message (result counts, form status).',
  ],
  donts: [
    "Don't announce every keystroke or timer tick; debounce it.",
    "Don't use assertive for anything that isn't an error or urgent warning.",
    "Don't announce what already has focus: screen readers read focused elements on their own.",
  ],
  a11y: [
    'Supports WCAG 4.1.3 Status Messages: status changes are announced without moving focus.',
    'Live regions are visually hidden with .os-sr-only, not display: none, so they stay in the accessibility tree.',
    'SSR safe: the fallback regions are created on first use, never during render.',
  ],
  classes: '[data-os-announcer="polite"][role="status"]\n[data-os-announcer="assertive"][role="alert"]',
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'alert',
  order: 40,
  name: 'Alert',
  group: 'Feedback',
  summary:
    'Inline messages for status changes and things that need attention. Eight theme colors, icons, headings with additional content, styled links, and dismissal that is uncontrolled, controlled, or driven from code.',
  importLine: "import { Alert, AlertHeading, AlertLink } from 'onesmallui';",
  examples: [
    { name: 'alert-basic', title: 'Theme colors' },
    { name: 'alert-content', title: 'Headings, links, icons and additional content' },
    {
      name: 'alert-dismiss',
      title: 'Dismissing',
      description: '`dismissible` hides the alert itself. For control from code, pass `open` and `onOpenChange` (for example from `useDisclosure`).',
    },
  ],
  props: [
    {
      title: 'Alert',
      props: [
        { name: 'color', type: status, default: "'info'", description: 'Color role and default icon.' },
        { name: 'title', type: 'ReactNode', description: 'Bold first line.' },
        { name: 'icon', type: 'ReactNode | false', description: 'Replace the default icon, or hide it with false.' },
        { name: 'dismissible', type: 'boolean', description: 'Shows a close button; the alert hides itself when pressed.' },
        { name: 'onDismiss', type: '() => void', description: 'Called on dismiss. On its own it shows the button and leaves removal to you.' },
        { name: 'open / defaultOpen', type: 'boolean', default: 'true', description: 'Visibility, controlled or initial.' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called with false on dismiss.' },
        { name: 'dismissLabel', type: 'string', default: "'Dismiss'", description: 'Accessible name of the close button.' },
        { name: 'live', type: "'off' | 'polite' | 'assertive'", default: "'off'", description: 'Announce when it appears (role status or alert).' },
      ],
    },
    {
      title: 'AlertHeading',
      props: [{ name: 'as', type: 'ElementType', default: "'h3'", description: 'Heading element, to fit the page outline.' }],
    },
    {
      title: 'AlertLink',
      props: [{ name: '…anchor props', type: 'AnchorHTMLAttributes', description: 'A link colored to match, always underlined.' }],
    },
  ],
  a11y: [
    'Set live="polite" for alerts that appear after an action, "assertive" only for urgent errors. Leave static alerts at "off".',
    'Icons are decorative and pair with text; meaning never relies on color alone. Alert links are underlined for the same reason.',
    'Give each close button a specific dismissLabel when there are several alerts. After dismissing, move focus somewhere sensible if the button had focus (for example the next heading).',
    'Text on every tinted background meets 7:1 in both themes.',
  ],
  classes:
    '.os-alert[data-color][data-dismissible] > .os-alert__icon + .os-alert__content > .os-alert__title | .os-alert__body\n.os-alert__heading  .os-alert__link  .os-alert > .os-close-btn',
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'alert',
  order: 40,
  name: 'Alert',
  group: 'Feedback',
  summary: 'Inline messages for status changes and things that need attention.',
  importLine: "import { Alert } from 'onesmallui';",
  examples: [{ name: 'alert-basic', title: 'Status colors and dismiss' }],
  props: [
    {
      title: 'Alert',
      props: [
        { name: 'color', type: status, default: "'info'", description: 'Color role and default icon.' },
        { name: 'title', type: 'ReactNode', description: 'Bold first line.' },
        { name: 'icon', type: 'ReactNode', description: 'Replace the default icon.' },
        { name: 'onDismiss', type: '() => void', description: 'Shows a 44px close button.' },
        { name: 'live', type: "'off' | 'polite' | 'assertive'", default: "'off'", description: 'Announce when it appears (role status or alert).' },
      ],
    },
  ],
  a11y: [
    'Set live="polite" for alerts that appear after an action, "assertive" only for urgent errors.',
    'Icons pair with text; meaning never relies on color alone.',
  ],
  classes: '.os-alert[data-color]',
};

export default doc;

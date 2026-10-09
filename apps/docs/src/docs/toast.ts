import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'toast',
  order: 110,
  name: 'Toast',
  group: 'Feedback',
  summary: 'Stacked notifications with actions, pause-on-hover timers, and slide animations.',
  importLine: "import { ToastProvider, useToast } from 'onesmallui';",
  examples: [{ name: 'toast-basic', title: 'Triggering toasts' }],
  props: [
    {
      title: 'ToastProvider',
      props: [
        { name: 'placement', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom'", default: "'bottom-right'", description: 'Screen corner.' },
        { name: 'defaultDuration', type: 'number | null', default: 'null', description: 'Auto-dismiss time. null keeps toasts until dismissed (2.2.3 AAA).' },
        { name: 'limit', type: 'number', default: '5', description: 'Max visible toasts.' },
      ],
    },
    {
      title: 'toast(options)',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Main line.' },
        { name: 'description', type: 'ReactNode', description: 'Second line.' },
        { name: 'color', type: status, default: "'info'", description: 'Color role.' },
        { name: 'duration', type: 'number | null', description: 'Overrides the provider default.' },
        { name: 'action', type: '{ label, onClick }', description: 'Optional button.' },
      ],
    },
  ],
  a11y: [
    'Toasts are announced politely (danger toasts assertively).',
    'Timers pause on hover and focus; by default toasts never time out (WCAG 2.2.3 No Timing).',
  ],
};

export default doc;

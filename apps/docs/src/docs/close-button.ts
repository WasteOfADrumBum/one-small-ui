import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'close-button',
  order: 30,
  name: 'Close Button',
  group: 'Actions',
  summary:
    'A reusable dismiss control in three sizes, with an overlay variant for photos and dark imagery. Alerts, dialogs, drawers and toasts use it.',
  importLine: "import { CloseButton } from 'onesmallui';",
  examples: [{ name: 'close-button-basic', title: 'Sizes, disabled and on imagery' }],
  props: [
    {
      title: 'CloseButton',
      props: [
        { name: 'label', type: 'string', default: "'Close'", description: 'Accessible name. Make it specific: "Dismiss upload alert".' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Visual size; the hit area stays at least 44×44px.' },
        { name: 'variant', type: "'default' | 'overlay'", default: "'default'", description: 'overlay sits on a dark translucent disc with dark-theme tokens.' },
        { name: '…button props', type: 'ButtonHTMLAttributes', description: 'onClick, disabled, etc.' },
      ],
    },
  ],
  a11y: [
    'Always a real <button type="button"> with an aria-label; the × icon is hidden from assistive tech.',
    'The small size keeps a 44px hit area with an invisible extension (WCAG 2.5.5).',
    'The overlay variant renders with dark-theme tokens on its own backdrop, so the icon and focus ring keep their contrast over any image.',
    'In dialogs, Escape should do the same as the close button, and focus returns to the trigger.',
  ],
  classes: '.os-close-btn[data-size][data-variant]',
};

export default doc;

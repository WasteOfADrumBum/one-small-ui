import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'toast',
  order: 110,
  name: 'Toast',
  group: 'Feedback',
  summary:
    'Stacked notifications with a header (icon, title, time), body, custom content and actions. Nine placements, persistent by default with opt-in pausable auto-hide, instant or animated, soft, solid (color fill), dark and translucent styles. Use the provider, or <Toast> on its own.',
  importLine: "import { ToastProvider, useToast, Toast, ToastStack } from 'onesmallui';",
  examples: [
    { name: 'toast-basic', title: 'Triggering toasts' },
    { name: 'toast-header', title: 'Header, custom content and actions' },
    { name: 'toast-static', title: 'Standalone toasts, stacked', description: 'Solid (themed color fill), dark and translucent styles.' },
    { name: 'toast-placement', title: 'Placement' },
  ],
  props: [
    {
      title: 'ToastProvider',
      props: [
        {
          name: 'placement',
          type: "'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
          default: "'bottom-right'",
          description: "Screen position. 'top' and 'bottom' remain as aliases for the centered ones.",
        },
        { name: 'defaultDuration', type: 'number | null', default: 'null', description: 'Auto-dismiss time. null keeps toasts until dismissed (2.2.3 AAA).' },
        { name: 'limit', type: 'number', default: '5', description: 'Max visible toasts.' },
        { name: 'defaults', type: '{ variant, appearance, instant, color }', description: 'Defaults for every toast.' },
        { name: 'label', type: 'string', default: "'Notifications'", description: 'Name of the notifications region.' },
      ],
    },
    {
      title: 'toast(options) / <Toast>',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Main line.' },
        { name: 'description', type: 'ReactNode', description: 'Body text.' },
        { name: 'icon / time', type: 'ReactNode', description: 'Header icon and meta text.' },
        { name: 'content (toast) / children (Toast)', type: 'ReactNode', description: 'Custom content under the body.' },
        { name: 'action', type: '{ label, onClick }', description: 'Optional button; dismisses after running.' },
        { name: 'color', type: status, default: "'info'", description: 'Color role.' },
        { name: 'variant', type: "'soft' | 'solid'", default: "'soft'", description: 'solid fills with the theme color.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Surface style.' },
        { name: 'duration', type: 'number | null', default: 'null', description: 'Auto-hide after ms; pauses on hover and focus.' },
        { name: 'instant', type: 'boolean', description: 'No enter/exit animation.' },
        { name: 'onDismiss (Toast)', type: '() => void', description: 'Shows the close button; called by it, the action and the timer.' },
        { name: 'role (Toast)', type: "'status' | 'alert'", default: "alert for danger, else status", description: 'Live-region politeness.' },
      ],
    },
    {
      title: 'ToastStack',
      props: [{ name: 'placement', type: "ToastPlacement | 'inline'", default: "'bottom-right'", description: 'Fixed position or in the page flow.' }],
    },
  ],
  a11y: [
    'Toasts are announced politely (role="status"); danger toasts assertively (role="alert").',
    'By default toasts never time out (WCAG 2.2.3 No Timing). Auto-hide is opt-in and pauses on hover and focus.',
    'Solid toasts use the on-<color> token for every part, including the focus ring, so text stays at 7:1.',
    'The close and action buttons are 44px targets with visible labels or aria-labels.',
  ],
  classes: `.os-toast-viewport[data-placement] > .os-toast-viewport__list
  > .os-toast[data-color][data-variant][data-state][data-instant][data-appearance]
    > .os-toast__content > .os-toast__header > .os-toast__icon + .os-toast__title + .os-toast__time
                         > .os-toast__description + .os-toast__action`,
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'dialog',
  order: 70,
  name: 'Dialog',
  group: 'Overlays',
  summary:
    'Modal and non-modal dialogs on the native <dialog> element: built-in focus management, static backdrops, scrollable bodies, sizes, responsive fullscreen and four animations. Replaces Modal.',
  importLine: "import { Dialog } from 'onesmallui';",
  examples: [
    { name: 'dialog-basic', title: 'Modal dialog', description: 'showModal(): focus is trapped and the page is inert. autoFocus picks the initial focus.' },
    { name: 'dialog-nonmodal', title: 'Non-modal dialog', description: 'show(): no backdrop, the page stays usable.' },
    { name: 'dialog-backdrop', title: 'Static backdrop', description: 'Backdrop clicks nudge the dialog instead of closing it. initialFocus moves focus to a specific element.' },
    { name: 'dialog-scrollable', title: 'Scrollable content', description: 'By default the body scrolls between a fixed header and footer; scrollable={false} scrolls the whole dialog.' },
    { name: 'dialog-sizes', title: 'Sizes and fullscreen', description: 'Fullscreen always, or only below a breakpoint.' },
    { name: 'dialog-swap', title: 'Swapping dialogs', description: 'Open a second dialog from the first; returnFocus sends focus back to the original trigger.' },
    { name: 'dialog-animations', title: 'Animations and dark appearance' },
  ],
  props: [
    {
      title: 'Dialog',
      props: [
        { name: 'open', type: 'boolean', description: 'Controls visibility.' },
        { name: 'onClose', type: '() => void', description: 'Escape, the close button, or a backdrop click.' },
        { name: 'title', type: 'ReactNode', description: 'Labels the dialog (aria-labelledby).' },
        { name: 'description', type: 'ReactNode', description: 'Describes the dialog (aria-describedby).' },
        { name: 'footer', type: 'ReactNode', description: 'Action row, fixed under the body.' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width.' },
        { name: 'fullscreen', type: "boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", description: 'Fill the screen always, or below a breakpoint.' },
        { name: 'modal', type: 'boolean', default: 'true', description: 'showModal() (true) or show() (false).' },
        { name: 'backdrop', type: "boolean | 'static'", default: 'true', description: "'static' ignores backdrop clicks; false hides the backdrop." },
        { name: 'scrollable', type: 'boolean', default: 'true', description: 'Body scrolls (true) or the whole dialog scrolls (false).' },
        { name: 'animation', type: "'scale' | 'fade' | 'slide-down' | 'slide-up' | 'none'", default: "'scale'", description: "Enter/exit motion. 'none' is instant." },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'dark re-scopes every token to the dark theme.' },
        { name: 'initialFocus', type: 'RefObject<HTMLElement>', description: 'Element focused on open (else the autoFocus element, else the browser default).' },
        { name: 'returnFocus', type: 'boolean | RefObject<HTMLElement>', default: 'true', description: 'Where focus goes on close: the opener, a given element, or nowhere.' },
        { name: 'scrollLock', type: 'boolean', default: 'modal', description: 'Lock page scroll while open.' },
        { name: 'hideCloseButton / closeLabel', type: 'boolean / string', default: "false / 'Close dialog'", description: 'The header × button.' },
      ],
    },
    {
      title: 'Modal (deprecated)',
      props: [
        { name: 'placement', type: "'center' | 'left' | 'right' | 'bottom'", default: "'center'", description: "Kept for compatibility: 'center' renders a Dialog, others a Drawer." },
        { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: "false maps to backdrop='static'." },
      ],
    },
  ],
  a11y: [
    'Modal dialogs use showModal(): focus is trapped, the rest of the page is inert and scroll is locked.',
    'Focus moves in on open (autoFocus, initialFocus, or the browser default) and returns to the opener on close.',
    'Escape closes modal and non-modal dialogs. A static backdrop only ignores pointer clicks; Escape and the close button still work.',
    'Labelled by its title and described by its description. Every target, including the close button, is at least 44×44px.',
    'All motion uses duration tokens, so it switches off with prefers-reduced-motion or data-os-motion="off".',
  ],
  classes: `dialog.os-dialog[data-size][data-fullscreen][data-animation][data-modal][data-backdrop][data-scrollable][data-state]
  > .os-dialog__panel
    > .os-dialog__header > .os-dialog__title + .os-dialog__description
    > .os-dialog__body
    > .os-dialog__footer
dialog[data-shake] /* static backdrop nudge */`,
};

export default doc;

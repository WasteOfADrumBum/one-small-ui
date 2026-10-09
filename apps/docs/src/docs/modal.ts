import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'modal',
  order: 70,
  name: 'Modal & Drawer',
  group: 'Overlays',
  summary: 'Dialogs, side drawers and bottom sheets on the native <dialog> element, with enter and exit animations.',
  importLine: "import { Modal } from 'onesmallui';",
  examples: [
    { name: 'modal-basic', title: 'Dialog' },
    { name: 'modal-drawer', title: 'Drawers and bottom sheet' },
  ],
  props: [
    {
      title: 'Modal',
      props: [
        { name: 'open', type: 'boolean', description: 'Controls visibility.' },
        { name: 'onClose', type: '() => void', description: 'Escape, close button or backdrop click.' },
        { name: 'title', type: 'ReactNode', description: 'Required. Labels the dialog.' },
        { name: 'description', type: 'ReactNode', description: 'Describes the dialog.' },
        { name: 'footer', type: 'ReactNode', description: 'Action row.' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width.' },
        { name: 'placement', type: "'center' | 'left' | 'right' | 'bottom'", default: "'center'", description: 'Dialog, drawer or sheet.' },
        { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when the backdrop is clicked.' },
      ],
    },
  ],
  a11y: [
    'showModal() traps focus and makes the rest of the page inert.',
    'Focus returns to the element that opened it.',
    'Labelled by its title and described by its description.',
  ],
  classes: 'dialog.os-modal[data-size][data-placement] > .os-modal__panel',
};

export default doc;

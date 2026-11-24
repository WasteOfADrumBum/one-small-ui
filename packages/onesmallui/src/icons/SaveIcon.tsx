import { createIcon } from './Icon';

/** A floppy disk: save, keep changes. */
export const SaveIcon = createIcon(
  'Save',
  <>
    <path d="M5.5 3.5h10l5 5v10a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
    <path d="M7.5 20.5v-6h9v6" />
    <path d="M8 3.5V7h6" />
  </>,
);

import { createIcon } from './Icon';

/** A counter-clockwise arrow, RefreshIcon mirrored: undo, revert, rotate back. */
export const UndoIcon = createIcon(
  'Undo',
  <>
    <path d="M4 12a8 8 0 1 0 1.07-4" />
    <path d="M4 3.5V8h4.5" />
  </>,
);

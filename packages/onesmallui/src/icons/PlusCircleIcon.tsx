import { createIcon } from './Icon';

/** A circled plus: add, create new. */
export const PlusCircleIcon = createIcon(
  'PlusCircle',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </>,
);

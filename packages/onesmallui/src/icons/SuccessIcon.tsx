import { createIcon } from './Icon';

/** A circled check: success, complete. */
export const SuccessIcon = createIcon(
  'Success',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.75 2.75L16 10" />
  </>,
);

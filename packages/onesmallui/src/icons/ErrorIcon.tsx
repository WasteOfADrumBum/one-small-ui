import { createIcon } from './Icon';

/** A circled cross: error, failure. */
export const ErrorIcon = createIcon(
  'Error',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6m0-6-6 6" />
  </>,
);

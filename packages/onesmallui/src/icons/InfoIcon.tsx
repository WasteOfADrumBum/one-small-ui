import { createIcon } from './Icon';

/** A circled "i": information. */
export const InfoIcon = createIcon(
  'Info',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <path d="M12 7.75h.01" />
  </>,
);

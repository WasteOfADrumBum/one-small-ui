import { createIcon } from './Icon';

/** A triangle with "!": warning, caution. */
export const WarningIcon = createIcon(
  'Warning',
  <>
    <path d="M12 3.75 21 20H3Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </>,
);

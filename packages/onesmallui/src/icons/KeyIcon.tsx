import { createIcon } from './Icon';

/** A key: access, passwords, API keys. */
export const KeyIcon = createIcon(
  'Key',
  <>
    <circle cx="8" cy="16" r="4.5" />
    <path d="M11.2 12.8 20 4" />
    <path d="m16.5 7.5 2.5 2.5" />
    <path d="m14 10 2 2" />
  </>,
);

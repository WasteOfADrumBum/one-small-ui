import { createIcon } from './Icon';

/** A head and shoulders: account, profile. */
export const UserIcon = createIcon(
  'User',
  <>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </>,
);

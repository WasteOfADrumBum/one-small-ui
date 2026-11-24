import { createIcon } from './Icon';

/** A closed padlock: locked, private, secure. */
export const LockIcon = createIcon(
  'Lock',
  <>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5v-3a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2" />
  </>,
);

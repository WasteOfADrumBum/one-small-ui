import { createIcon } from './Icon';

/** Three dots in a row: more actions. */
export const MoreHorizontalIcon = createIcon(
  'MoreHorizontal',
  <>
    <circle cx="5" cy="12" r="1.25" fill="currentColor" />
    <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    <circle cx="19" cy="12" r="1.25" fill="currentColor" />
  </>,
);

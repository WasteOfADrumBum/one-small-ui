import { createIcon } from './Icon';

/** An open tray: an inbox, nothing here yet, no data. */
export const InboxIcon = createIcon(
  'Inbox',
  <>
    <path d="M3 13 5.6 5.4A2 2 0 0 1 7.5 4h9a2 2 0 0 1 1.9 1.4L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M3 13h5l1.5 3h5l1.5-3h5" />
  </>,
);

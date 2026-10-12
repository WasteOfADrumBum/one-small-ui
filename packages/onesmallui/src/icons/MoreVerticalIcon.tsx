import { createIcon } from './Icon';

/** Three stacked dots: more actions. */
export const MoreVerticalIcon = createIcon(
  'MoreVertical',
  <>
    <circle cx="12" cy="5" r="1.25" fill="currentColor" />
    <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    <circle cx="12" cy="19" r="1.25" fill="currentColor" />
  </>,
);

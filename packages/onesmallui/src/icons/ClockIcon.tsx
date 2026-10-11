import { createIcon } from './Icon';

/** A clock face: time, history. */
export const ClockIcon = createIcon(
  'Clock',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </>,
);

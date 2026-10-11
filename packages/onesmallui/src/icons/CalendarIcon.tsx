import { createIcon } from './Icon';

/** A calendar page: dates, scheduling. */
export const CalendarIcon = createIcon(
  'Calendar',
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </>,
);

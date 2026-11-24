import { createIcon } from './Icon';

/** A calendar page with a check: scheduled, attending, done on a date. */
export const CalendarCheckIcon = createIcon(
  'CalendarCheck',
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="m9 15 2 2 4-4" />
  </>,
);

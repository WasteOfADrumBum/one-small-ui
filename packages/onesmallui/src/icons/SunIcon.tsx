import { createIcon } from './Icon';

/** A sun: light theme. */
export const SunIcon = createIcon(
  'Sun',
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2.25M18.36 5.64l-1.59 1.59M21 12h-2.25M18.36 18.36l-1.59-1.59M12 21v-2.25M5.64 18.36l1.59-1.59M3 12h2.25M5.64 5.64l1.59 1.59" />
  </>,
);

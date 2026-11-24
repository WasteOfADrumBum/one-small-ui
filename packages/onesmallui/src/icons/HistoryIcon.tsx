import { createIcon } from './Icon';

/** A clock face with a counter-clockwise arrow: history, recent activity, version log. */
export const HistoryIcon = createIcon(
  'History',
  <>
    <path d="M4 12a8 8 0 1 0 1.07-4" />
    <path d="M4 3.5V8h4.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);

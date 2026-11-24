import { createIcon } from './Icon';

/** A list with checked rows: checklists, completed tasks, to-dos. */
export const ListChecksIcon = createIcon(
  'ListChecks',
  <>
    <path d="m3.5 7 2 2 4-4" />
    <path d="m3.5 16 2 2 4-4" />
    <path d="M13 7h7.5M13 16h7.5" />
  </>,
);

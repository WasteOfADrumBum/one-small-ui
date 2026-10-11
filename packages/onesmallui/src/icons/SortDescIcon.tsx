import { createIcon } from './Icon';

/** A down arrow with long-to-short bars: sort descending. */
export const SortDescIcon = createIcon(
  'SortDesc',
  <>
    <path d="M7 4.5v15" />
    <path d="M3.5 16 7 19.5l3.5-3.5" />
    <path d="M13.5 18h3M13.5 12h5M13.5 6h7" />
  </>,
);

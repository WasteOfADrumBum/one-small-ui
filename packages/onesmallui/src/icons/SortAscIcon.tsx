import { createIcon } from './Icon';

/** An up arrow with short-to-long bars: sort ascending. */
export const SortAscIcon = createIcon(
  'SortAsc',
  <>
    <path d="M7 19.5v-15" />
    <path d="M3.5 8 7 4.5 10.5 8" />
    <path d="M13.5 6h3M13.5 12h5M13.5 18h7" />
  </>,
);

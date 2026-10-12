import { createIcon } from './Icon';

/** A three-quarter ring that spins (`data-spin`) for loading states. Motion stops under reduced motion. */
export const LoaderIcon = createIcon(
  'Loader',
  <path d="M12 3a9 9 0 1 1-9 9" />,
  { 'data-spin': '' },
);

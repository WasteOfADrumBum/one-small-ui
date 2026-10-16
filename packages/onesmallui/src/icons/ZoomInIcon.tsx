import { createIcon } from './Icon';

/** A magnifier with a plus: zoom in, enlarge. */
export const ZoomInIcon = createIcon(
  'ZoomIn',
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.25 15.25 4.75 4.75" />
    <path d="M10.5 8v5M8 10.5h5" />
  </>,
);

import { createIcon } from './Icon';

/** A magnifier with a minus: zoom out, shrink. */
export const ZoomOutIcon = createIcon(
  'ZoomOut',
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.25 15.25 4.75 4.75" />
    <path d="M8 10.5h5" />
  </>,
);

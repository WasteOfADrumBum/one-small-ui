import { createIcon } from './Icon';

/** Points left: previous, back. Flip it in RTL with `scale: var(--os-dir) 1`. */
export const ChevronLeftIcon = createIcon(
  'ChevronLeft',
  <path d="M15 5.5 8.5 12l6.5 6.5" />,
);

import { createIcon } from './Icon';

/** Points right: next, forward, submenu. Flip it in RTL with `scale: var(--os-dir) 1`. */
export const ChevronRightIcon = createIcon(
  'ChevronRight',
  <path d="M9 5.5 15.5 12 9 18.5" />,
);

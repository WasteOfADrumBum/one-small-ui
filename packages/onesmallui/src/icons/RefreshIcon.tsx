import { createIcon } from './Icon';

/** A circular arrow: refresh, reload, retry. */
export const RefreshIcon = createIcon(
  'Refresh',
  <>
    <path d="M20 12a8 8 0 1 1-1.07-4" />
    <path d="M20 3.5V8h-4.5" />
  </>,
);

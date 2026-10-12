import { createIcon } from './Icon';

/** Two stacked sheets: copy to clipboard. */
export const CopyIcon = createIcon(
  'Copy',
  <>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
  </>,
);

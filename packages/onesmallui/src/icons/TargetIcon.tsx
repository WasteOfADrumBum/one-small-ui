import { createIcon } from './Icon';

/** Concentric rings with a center dot: goals, focus, targets. */
export const TargetIcon = createIcon(
  'Target',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </>,
);

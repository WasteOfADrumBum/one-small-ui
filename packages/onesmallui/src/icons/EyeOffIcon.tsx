import { createIcon } from './Icon';

/** A struck-through eye: hide, hidden. */
export const EyeOffIcon = createIcon(
  'EyeOff',
  <>
    <path d="M3 12c2-3.9 5.3-6.5 9-6.5s7 2.6 9 6.5c-2 3.9-5.3 6.5-9 6.5S5 15.9 3 12Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="m4 4 16 16" />
  </>,
);

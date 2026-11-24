import { createIcon } from './Icon';

/** An arrow leaving a doorway: sign out, log out. */
export const LogOutIcon = createIcon(
  'LogOut',
  <>
    <path d="M9.5 20.5h-4a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h4" />
    <path d="M10 12h10.5" />
    <path d="m16 7.5 4.5 4.5-4.5 4.5" />
  </>,
);

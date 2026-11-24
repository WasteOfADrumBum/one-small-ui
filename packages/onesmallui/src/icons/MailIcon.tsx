import { createIcon } from './Icon';

/** An envelope: email, messages, contact. */
export const MailIcon = createIcon(
  'Mail',
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 7.5 12 13l8.5-5.5" />
  </>,
);

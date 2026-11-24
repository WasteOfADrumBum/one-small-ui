import { createIcon } from './Icon';

/** A friendly robot head: assistant, AI, automation. */
export const BotIcon = createIcon(
  'Bot',
  <>
    <rect x="4.5" y="8" width="15" height="11.5" rx="3" />
    <path d="M12 8V5.5" />
    <circle cx="12" cy="4.25" r="1.25" />
    <path d="M4.5 12.5H3v3h1.5M19.5 12.5H21v3h-1.5" />
    <path d="M9.5 12v1.5M14.5 12v1.5" />
    <path d="M9.75 16a3 3 0 0 0 4.5 0" />
  </>,
);

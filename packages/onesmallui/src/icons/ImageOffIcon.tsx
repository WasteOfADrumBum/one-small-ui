import { createIcon } from './Icon';

/** A struck-through picture: broken or missing image. */
export const ImageOffIcon = createIcon(
  'ImageOff',
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="15.5" cy="8.5" r="1.5" />
    <path d="m3.5 17 5-5 4 4 2-2 6 6" />
    <path d="m3 3 18 18" />
  </>,
);

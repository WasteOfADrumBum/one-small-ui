import { createIcon } from './Icon';

/** A four-point star with two glints: new, first use, magic. */
export const SparklesIcon = createIcon(
  'Sparkles',
  <>
    <path d="M10 5c.7 4.9 2.1 6.3 7 7-4.9.7-6.3 2.1-7 7-.7-4.9-2.1-6.3-7-7 4.9-.7 6.3-2.1 7-7Z" />
    <path d="M18 3v4m-2-2h4M19 15.5v3m-1.5-1.5h3" />
  </>,
);

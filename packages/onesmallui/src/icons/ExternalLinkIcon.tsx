import { createIcon } from './Icon';

/** A box with an outgoing arrow: opens elsewhere. */
export const ExternalLinkIcon = createIcon(
  'ExternalLink',
  <>
    <path d="M18.5 13.5v5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h5" />
    <path d="M14.5 3.5h6v6" />
    <path d="M20.5 3.5 11 13" />
  </>,
);

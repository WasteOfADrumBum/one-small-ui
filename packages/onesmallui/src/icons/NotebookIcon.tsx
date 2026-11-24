import { createIcon } from './Icon';

/** A bound notebook with a label: notes, journal, notebook. */
export const NotebookIcon = createIcon(
  'Notebook',
  <>
    <rect x="5.5" y="3.5" width="14" height="17" rx="2" />
    <path d="M3.5 8h4M3.5 12h4M3.5 16h4" />
    <path d="M11.5 8.5H16M11.5 12H16" />
  </>,
);

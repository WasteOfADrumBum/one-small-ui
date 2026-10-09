import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'z-index',
  order: 140,
  name: 'Z-index',
  group: 'Layout & media',
  summary: 'Stacking utilities: a few low layers for local overlap, plus named layers that match the components (dropdown, sticky, overlay, modal, toast, tooltip).',
  examples: [
    {
      name: 'z-index-basic',
      title: 'Local stacking',
    },
  ],
  reference: [
    {
      title: 'Z-index classes',
      columns: ['Class', 'Value'],
      rows: [
        ['.os-z-n1', '-1'],
        ['.os-z-0 … .os-z-3', '0 – 3'],
        ['.os-z-auto', 'auto'],
        ['.os-z-dropdown', '1000'],
        ['.os-z-sticky', '1100'],
        ['.os-z-overlay', '1300'],
        ['.os-z-modal', '1400'],
        ['.os-z-toast', '1500'],
        ['.os-z-tooltip', '1600'],
      ],
    },
  ],
  a11y: ['Make sure stacked content never hides focused elements (WCAG 2.4.11 Focus Not Obscured).'],
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'loading',
  order: 120,
  name: 'Progress, Spinner, Skeleton',
  group: 'Feedback',
  summary: 'Show progress and loading states.',
  importLine: "import { Progress, Spinner, Skeleton } from 'onesmallui';",
  examples: [{ name: 'loading-basic', title: 'Loading states' }],
  props: [
    {
      title: 'Progress',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required accessible name.' },
        { name: 'value', type: 'number', description: 'Omit for indeterminate.' },
        { name: 'max', type: 'number', default: '100', description: 'Maximum.' },
        { name: 'showValue', type: 'boolean', description: 'Show the percentage.' },
        { name: 'color / size', type: 'StatusColor / Size', description: 'Look.' },
      ],
    },
    {
      title: 'Skeleton',
      props: [
        { name: 'shape', type: "'text' | 'rect' | 'circle'", default: "'text'", description: 'Placeholder shape.' },
        { name: 'lines', type: 'number', default: '1', description: 'Text lines.' },
        { name: 'width / height', type: 'CSS size', description: 'Dimensions.' },
      ],
    },
  ],
  a11y: [
    'Progress uses role="progressbar" with aria-valuenow.',
    'Spinners announce their label via role="status"; skeletons are hidden from assistive tech, so mark the region aria-busy.',
    'With reduced motion, spinners pulse slowly instead of spinning.',
  ],
};

export default doc;

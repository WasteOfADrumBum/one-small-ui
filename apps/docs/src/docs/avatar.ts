import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'avatar',
  order: 130,
  name: 'Avatar',
  group: 'Data display',
  summary: 'Pictures or initials, with presence status.',
  importLine: "import { Avatar } from 'onesmallui';",
  examples: [{ name: 'avatar-basic', title: 'Sizes and status' }],
  props: [
    {
      title: 'Avatar',
      props: [
        { name: 'name', type: 'string', description: 'Required. Used for the label and initials.' },
        { name: 'src', type: 'string', description: 'Image URL. Falls back to initials on error.' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
        { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Included in the accessible name.' },
        { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape.' },
      ],
    },
  ],
  a11y: ['Exposed as an image named "Name (status)", so status is not conveyed by color alone.'],
};

export default doc;

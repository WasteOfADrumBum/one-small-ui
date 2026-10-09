import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'avatar',
  order: 130,
  name: 'Avatar',
  group: 'Data display',
  summary: 'Pictures or initials in six sizes, with presence status, theme colors and overlapping stacks with a "+N" counter.',
  importLine: "import { Avatar, AvatarGroup } from 'onesmallui';",
  examples: [
    { name: 'avatar-basic', title: 'Sizes, status, images and initials colors' },
    { name: 'avatar-group', title: 'Stacks and overflow count', description: '`max` limits the visible avatars; `total` counts people you have not loaded.' },
  ],
  props: [
    {
      title: 'Avatar',
      props: [
        { name: 'name', type: 'string', description: 'Required. Used for the label and initials.' },
        { name: 'src', type: 'string', description: 'Image URL. Falls back to initials on error.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'", default: "'md'", description: 'Size (inherits from AvatarGroup).' },
        { name: 'color', type: status, description: 'Background and text color for initials.' },
        { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Included in the accessible name.' },
        { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape.' },
      ],
    },
    {
      title: 'AvatarGroup',
      props: [
        { name: 'label', type: 'string', default: "'People'", description: 'Accessible name of the group.' },
        { name: 'max', type: 'number', description: 'Visible avatars before the counter.' },
        { name: 'total', type: 'number', description: 'Total people, when you pass only some.' },
        { name: 'size', type: 'AvatarSize', default: "'md'", description: 'Size of every avatar.' },
        { name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'normal'", description: 'Overlap.' },
        { name: 'overflowLabel', type: '(hidden: number) => string', default: '`${n} more`', description: 'Accessible name of the counter.' },
        { name: 'renderOverflow', type: '(hidden: number) => ReactNode', description: 'Custom counter content.' },
      ],
    },
  ],
  a11y: [
    'Each avatar is an image named "Name (status)", so status is not conveyed by color alone.',
    'AvatarGroup is a named group; the counter is an image named "N more" (customize with overflowLabel).',
    'Initials colors use <color>-text on <color>-soft, which meets 7:1 in both themes.',
  ],
  classes: '.os-avatar[data-size][data-shape][data-color][data-overflow] > .os-avatar__img | .os-avatar__initials, .os-avatar__status[data-status]\n.os-avatar-group[data-size][data-spacing]',
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'sortable',
  order: 170,
  name: 'SortableList',
  group: 'Drag & drop',
  summary: 'Reorder items by dragging with mouse, touch or pen, or entirely by keyboard.',
  importLine: "import { SortableList } from 'onesmallui';",
  examples: [
    { name: 'sortable-basic', title: 'Vertical list with handles', description: 'Drag the grip, or focus it and press Space, then arrow keys.' },
    { name: 'sortable-horizontal', title: 'Horizontal, drag anywhere' },
  ],
  props: [
    {
      title: 'SortableList',
      props: [
        { name: 'items', type: 'T[]', description: 'Items in order.' },
        { name: 'getKey', type: '(item) => string | number', description: 'Stable key.' },
        { name: 'getItemLabel', type: '(item) => string', description: 'Name used in announcements.' },
        { name: 'onReorder', type: '(items, { from, to }) => void', description: 'New order.' },
        { name: 'renderItem', type: '(item, { isDragging, index }) => ReactNode', description: 'Item content.' },
        { name: 'label', type: 'string', description: 'Accessible list name.' },
        { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Direction.' },
        { name: 'handle', type: 'boolean', default: 'true', description: 'Drag from the grip only.' },
      ],
    },
  ],
  a11y: [
    'Keyboard: Space or Enter picks up, arrows move, Home and End jump, Space drops, Escape cancels (2.1.1).',
    'Dragging is never the only way to reorder (2.5.7 Dragging Movements).',
    'Every pick-up, move and drop is announced.',
  ],
};

export default doc;

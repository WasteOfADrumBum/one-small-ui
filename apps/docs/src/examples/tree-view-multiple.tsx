import { useState } from 'react';
import { TreeView, type TreeNode } from '@onesmall/ui';

const crew: TreeNode[] = [
  {
    id: 'bridge',
    label: 'Bridge',
    children: [
      { id: 'grace', label: 'Grace Hopper' },
      { id: 'kat', label: 'Katherine Johnson' },
    ],
  },
  {
    id: 'science',
    label: 'Science',
    children: [
      { id: 'ada', label: 'Ada Lovelace' },
      { id: 'mae', label: 'Mae Jemison', disabled: true },
    ],
  },
];

// Space toggles, Shift + Arrow extends a range, Ctrl/Cmd + A selects every visible item.
export default function Example() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="os-grid os-gap-2">
      <TreeView
        aria-label="Away team"
        selectionMode="multiple"
        items={crew}
        defaultExpandedKeys={['bridge', 'science']}
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
      />
      <p className="os-text-sm os-text-muted">{selected.length} selected</p>
    </div>
  );
}

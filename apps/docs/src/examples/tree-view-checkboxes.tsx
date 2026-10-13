import { useState } from 'react';
import { TreeView, type TreeNode } from '@onesmall/ui';

const library: TreeNode[] = [
  {
    id: 'albums',
    label: 'Albums',
    children: [
      {
        id: 'blue',
        label: 'Blue Train',
        children: [
          { id: 'blue-1', label: 'Blue Train' },
          { id: 'blue-2', label: 'Moment’s Notice' },
          { id: 'blue-3', label: 'Locomotion' },
        ],
      },
      { id: 'kind', label: 'Kind of Blue', children: [{ id: 'kind-1', label: 'So What' }] },
    ],
  },
  { id: 'podcasts', label: 'Podcasts', children: [{ id: 'pod-1', label: 'Episode 1' }, { id: 'pod-2', label: 'Episode 2 (expired)', disabled: true }] },
];

// Leaf keys are the source of truth; parents show checked or mixed.
export default function Example() {
  const [checked, setChecked] = useState<string[]>(['blue-1']);
  return (
    <div className="os-grid os-gap-2">
      <TreeView
        aria-label="Sync to device"
        checkboxes
        items={library}
        defaultExpandedKeys={['albums', 'blue']}
        checkedKeys={checked}
        onCheckedKeysChange={setChecked}
      />
      <p className="os-text-sm os-text-muted">Syncing {checked.length} tracks</p>
    </div>
  );
}

import { useState } from 'react';
import { TreeView, type TreeNode } from '@onesmall/ui';

const files: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'tree', label: 'TreeView.tsx' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'tests', label: 'test', children: [{ id: 'tree-test', label: 'tree-view.test.tsx' }] },
  { id: 'readme', label: 'README.md' },
  { id: 'lock', label: 'package-lock.json', disabled: true },
];

export default function Example() {
  const [selected, setSelected] = useState<string[]>(['tree']);
  return (
    <div className="os-grid os-gap-2">
      <TreeView
        aria-label="Project files"
        items={files}
        defaultExpandedKeys={['src', 'components']}
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
      />
      <p className="os-text-sm os-text-muted">Open: {selected[0] ?? 'nothing'}</p>
    </div>
  );
}

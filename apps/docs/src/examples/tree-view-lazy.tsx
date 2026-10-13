import { TreeView, type TreeNode } from '@onesmall/ui';

const regions: TreeNode[] = [
  { id: 'eu', label: 'Europe', hasChildren: true },
  { id: 'us', label: 'United States', hasChildren: true },
  { id: 'offline', label: 'Offline region (fails once)', hasChildren: true },
];

const failed = new Set<string>();

// Children load on first expand. A rejected promise shows an error row with Retry.
async function loadChildren(node: TreeNode): Promise<TreeNode[]> {
  await new Promise((r) => setTimeout(r, 900));
  if (node.id === 'offline' && !failed.has(node.id)) {
    failed.add(node.id);
    throw new Error('Network error');
  }
  return [1, 2, 3].map((n) => ({ id: `${node.id}-${n}`, label: `${node.label} server ${n}` }));
}

export default function Example() {
  return <TreeView aria-label="Servers" items={regions} loadChildren={loadChildren} />;
}

import { useState } from 'react';
import { Button, DataTable, EmptyState, TreeView, type TreeNode } from '@onesmall/ui';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
];

export default function Example() {
  const [files, setFiles] = useState<TreeNode[]>([]);
  return (
    <div className="os-grid os-gap-4">
      <DataTable caption="Crew on board" data={[]} columns={columns} emptyState="No crew on board yet" />
      <DataTable
        caption="Cargo"
        data={[]}
        columns={columns}
        emptyState={
          <EmptyState
            preset="no-data"
            size="compact"
            headingLevel={4}
            title="No cargo logged"
            actions={<Button size="sm">Log cargo</Button>}
          />
        }
      />
      <div>
        <TreeView aria-label="Mission files" items={files} emptyState="No files uploaded" />
        <Button variant="outline" size="sm" onClick={() => setFiles(files.length ? [] : [{ id: 'plan', label: 'flight-plan.pdf' }])}>
          {files.length ? 'Remove the file' : 'Add a file'}
        </Button>
      </div>
    </div>
  );
}

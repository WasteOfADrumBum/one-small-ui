import { useState, type FormEvent } from 'react';
import { Badge, Button, DataTable, type DataTableColumn } from '@onesmall/ui';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On leave';
}

const members: Member[] = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Analyst', status: 'Active' },
  { id: 'grace', name: 'Grace Hopper', role: 'Captain', status: 'Active' },
  { id: 'kat', name: 'Katherine Johnson', role: 'Navigator', status: 'Active' },
  { id: 'mae', name: 'Mae Jemison', role: 'Medical officer', status: 'On leave' },
];

const columns: DataTableColumn<Member>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    cell: (m) => <Badge color={m.status === 'Active' ? 'success' : 'warning'}>{m.status}</Badge>,
  },
];

// Selected ids submit with the form as hidden inputs named "crew".
export default function Example() {
  const [selected, setSelected] = useState<string[]>(['grace']);
  const [sent, setSent] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(new FormData(e.currentTarget).getAll('crew').join(', '));
  };
  return (
    <form onSubmit={onSubmit}>
      <DataTable
        caption="Away team"
        data={members}
        columns={columns}
        selectable
        name="crew"
        selectedIds={selected}
        onSelectionChange={setSelected}
        isRowSelectable={(m) => m.status === 'Active'}
        getRowLabel={(m) => m.name}
        toolbar={
          <Button type="submit" disabled={selected.length === 0}>
            Assign {selected.length || ''}
          </Button>
        }
      />
      <p className="os-text-sm os-text-muted" aria-live="polite">
        {sent && `Submitted crew=${sent}`}
      </p>
    </form>
  );
}

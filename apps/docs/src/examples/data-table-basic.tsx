import { DataTable, type DataTableColumn } from '@onesmall/ui';

interface Mission {
  id: string;
  name: string;
  vehicle: string;
  crew: number;
  launched: string;
}

const missions: Mission[] = [
  { id: 'm1', name: 'Aurora I', vehicle: 'Kestrel', crew: 3, launched: '2031-04-12' },
  { id: 'm2', name: 'Bluebird', vehicle: 'Heron', crew: 2, launched: '2031-09-03' },
  { id: 'm3', name: 'Cassini Relay', vehicle: 'Kestrel', crew: 0, launched: '2032-01-22' },
  { id: 'm4', name: 'Dawn Patrol', vehicle: 'Osprey', crew: 4, launched: '2032-06-18' },
  { id: 'm5', name: 'Europa Survey', vehicle: 'Heron', crew: 5, launched: '2033-02-07' },
  { id: 'm6', name: 'Farside', vehicle: 'Osprey', crew: 2, launched: '2033-08-30' },
  { id: 'm7', name: 'Gemini Echo', vehicle: 'Kestrel', crew: 3, launched: '2034-03-15' },
];

const columns: DataTableColumn<Mission>[] = [
  { key: 'name', header: 'Mission', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true, hideable: true },
  { key: 'crew', header: 'Crew', sortable: true, align: 'end', hideable: true },
  {
    key: 'launched',
    header: 'Launched',
    sortable: true,
    hideable: true,
    cell: (m) => new Date(m.launched).toLocaleDateString('en', { dateStyle: 'medium', timeZone: 'UTC' }),
  },
];

// Sort with the header buttons (Shift + click adds a second sort), search, page and hide columns.
export default function Example() {
  return (
    <DataTable
      caption="Missions"
      data={missions}
      columns={columns}
      searchable
      multiSort
      pagination
      pageSizeOptions={[5, 10]}
      defaultSort={[{ key: 'launched', direction: 'descending' }]}
    />
  );
}

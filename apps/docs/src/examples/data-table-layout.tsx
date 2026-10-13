import { useState } from 'react';
import { DataTable, Select, type DataTableColumn, type DataTableDensity } from '@onesmall/ui';

interface Reading {
  id: string;
  sensor: string;
  deck: string;
  value: number;
}

const decks = ['Bridge', 'Engineering', 'Medical', 'Cargo'];
const readings: Reading[] = Array.from({ length: 24 }, (_, i) => ({
  id: `r${i}`,
  sensor: `T-${String(i + 1).padStart(2, '0')}`,
  deck: decks[i % decks.length]!,
  value: 18 + ((i * 13) % 9) + (i % 3) / 10,
}));

const columns: DataTableColumn<Reading>[] = [
  { key: 'sensor', header: 'Sensor', sortable: true, width: '8rem' },
  { key: 'deck', header: 'Deck', sortable: true, filterable: true },
  { key: 'value', header: 'Temperature (°C)', sortable: true, align: 'end', cell: (r) => r.value.toFixed(1) },
];

// A height-capped region with a sticky header, per-column filters and a density switch.
export default function Example() {
  const [density, setDensity] = useState<DataTableDensity>('compact');
  return (
    <div className="os-grid os-gap-4">
      <label className="os-flex os-items-center os-gap-2">
        Density
        <Select
          value={density}
          onChange={(e) => setDensity(e.target.value as DataTableDensity)}
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'default', label: 'Default' },
            { value: 'comfortable', label: 'Comfortable' },
          ]}
          style={{ width: 'auto' }}
        />
      </label>
      <DataTable
        caption="Deck temperatures"
        hideCaption
        data={readings}
        columns={columns}
        density={density}
        stickyHeader
        maxHeight="20rem"
        tableProps={{ striped: true, hover: true }}
        emptyState="No sensors on that deck."
      />
    </div>
  );
}

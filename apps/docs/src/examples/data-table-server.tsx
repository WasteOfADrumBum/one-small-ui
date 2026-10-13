import { useEffect, useState } from 'react';
import { DataTable, type DataTableColumn, type SortRule } from '@onesmall/ui';

interface Star {
  id: string;
  name: string;
  magnitude: number;
}

// A stand-in for your API: 120 stars, sorted, filtered and paged "on the server".
const catalogue: Star[] = Array.from({ length: 120 }, (_, i) => ({
  id: `hd-${1000 + i}`,
  name: `HD ${1000 + i * 37}`,
  magnitude: Math.round(((i * 7919) % 650) + 100) / 100,
}));

function fetchStars(q: { query: string; sort: SortRule[]; page: number; pageSize: number }) {
  return new Promise<{ rows: Star[]; total: number }>((resolve) => {
    let rows = catalogue.filter((s) => s.name.toLowerCase().includes(q.query.toLowerCase()));
    const rule = q.sort[0];
    if (rule) {
      const sign = rule.direction === 'ascending' ? 1 : -1;
      rows = [...rows].sort((a, b) => (a[rule.key as keyof Star] > b[rule.key as keyof Star] ? sign : -sign));
    }
    const start = (q.page - 1) * q.pageSize;
    setTimeout(() => resolve({ rows: rows.slice(start, start + q.pageSize), total: rows.length }), 400);
  });
}

const columns: DataTableColumn<Star>[] = [
  { key: 'name', header: 'Star', sortable: true },
  { key: 'magnitude', header: 'Magnitude', sortable: true, align: 'end' },
];

// manual: the table never sorts, filters or pages by itself. It reports changes; you fetch.
export default function Example() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortRule[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState<{ rows: Star[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);
    fetchStars({ query, sort, page, pageSize }).then((r) => {
      if (!current) return;
      setResult(r);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [query, sort, page, pageSize]);

  return (
    <DataTable
      caption="Star catalogue"
      data={result.rows}
      rowCount={result.total}
      columns={columns}
      manual
      loading={loading}
      loadingRows={pageSize}
      searchable
      globalFilter={query}
      onGlobalFilterChange={setQuery}
      sort={sort}
      onSortChange={setSort}
      pagination
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      emptyState="No stars match that name."
    />
  );
}

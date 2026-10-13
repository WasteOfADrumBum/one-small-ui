import { useState } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureAxe } from 'jest-axe';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { DataTable, compareValues, type DataTableColumn, type SortRule } from '../src/components/DataTable';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    region: { enabled: false },
  },
});

interface Crew {
  id: string;
  name: string;
  role: string;
  missions: number;
}

const crew: Crew[] = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Analyst', missions: 12 },
  { id: 'grace', name: 'Grace Hopper', role: 'Captain', missions: 31 },
  { id: 'kat', name: 'Katherine Johnson', role: 'Navigator', missions: 9 },
  { id: 'mae', name: 'Mae Jemison', role: 'Medical officer', missions: 4 },
  { id: 'sally', name: 'Sally Ride', role: 'Pilot', missions: 2 },
];

const columns: DataTableColumn<Crew>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true, hideable: true, filterable: true },
  { key: 'missions', header: 'Missions', sortable: true, align: 'end', hideable: true },
];

// Tables rendered without a provider announce through shared regions on <body>; drop them between tests.
afterEach(() => document.querySelectorAll('body > [data-os-announcer]').forEach((el) => el.remove()));

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));
const polite = () => document.querySelector<HTMLElement>('[data-os-announcer="polite"]');
const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).filter((r) => r.closest('tbody'));
const names = () => bodyRows().map((r) => within(r).getByRole('rowheader').textContent);

function renderTable(props: Partial<Parameters<typeof DataTable<Crew>>[0]> = {}) {
  return render(
    <AnnouncerProvider>
      <DataTable caption="Crew" data={crew} columns={columns} {...props} />
    </AnnouncerProvider>,
  );
}

describe('DataTable structure', () => {
  it('renders a native table named by its caption, with row headers and a scroll region', () => {
    renderTable({ hideCaption: true });
    const table = screen.getByRole('table', { name: 'Crew' });
    expect(table.tagName).toBe('TABLE');
    expect(table.querySelector('caption')).toHaveClass('os-sr-only');
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Role', 'Missions']);
    expect(screen.getAllByRole('rowheader')).toHaveLength(5);
    expect(screen.getByRole('region', { name: 'Crew' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('cell', { name: '31' })).toHaveAttribute('data-align', 'end');
  });

  it('uses accessor and cell renderers, and a chosen row header column', () => {
    render(
      <DataTable
        caption="Crew"
        data={crew}
        columns={[
          { key: 'role', header: 'Role' },
          { key: 'who', header: 'Who', accessor: (r) => r.name.toUpperCase(), rowHeader: true },
          { key: 'missions', header: 'Missions', cell: (r) => <strong>{r.missions} flights</strong> },
        ]}
      />,
    );
    expect(screen.getAllByRole('rowheader')[0]).toHaveTextContent('ADA LOVELACE');
    expect(screen.getByText('12 flights').tagName).toBe('STRONG');
  });

  it('passes density and stickyHeader to Table and sets maxHeight on the region', () => {
    renderTable({ density: 'compact', stickyHeader: true, maxHeight: '20rem' });
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(table).toHaveAttribute('data-sticky-header');
    const region = screen.getByRole('region');
    expect(region.style.maxHeight).toBe('20rem');
    expect(region).toHaveAttribute('data-scroll-y');
  });

  it('shows skeleton rows while loading and marks the table busy', () => {
    renderTable({ loading: true, loadingRows: 3, selectable: true });
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(table.querySelectorAll('.os-skeleton').length).toBe(9);
    expect(within(table).getByText('Loading')).toHaveClass('os-sr-only');
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeDisabled();
  });

  it('shows the empty state across every column', () => {
    renderTable({ data: [], selectable: true, emptyState: <p>No crew yet</p> });
    const cell = screen.getByText('No crew yet').closest('td')!;
    expect(cell).toHaveAttribute('colspan', '4');
  });
});

describe('DataTable sorting', () => {
  it('cycles ascending, descending and none, with aria-sort on the header', async () => {
    const user = userEvent.setup();
    renderTable();
    const header = screen.getByRole('columnheader', { name: 'Missions' });
    expect(header).toHaveAttribute('aria-sort', 'none');
    await user.click(screen.getByRole('button', { name: 'Missions' }));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Sally Ride', 'Mae Jemison', 'Katherine Johnson', 'Ada Lovelace', 'Grace Hopper']);
    await user.click(screen.getByRole('button', { name: 'Missions' }));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(names()[0]).toBe('Grace Hopper');
    await user.click(screen.getByRole('button', { name: 'Missions' }));
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(names()[0]).toBe('Ada Lovelace');
  });

  it('works from the keyboard and announces the sort', async () => {
    const user = userEvent.setup();
    renderTable();
    screen.getByRole('button', { name: 'Name' }).focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'descending');
    expect(names()[0]).toBe('Sally Ride');
    await wait(150);
    expect(polite()).toHaveTextContent('Sorted by Name, descending');
    await user.keyboard(' ');
    await wait(150);
    expect(polite()).toHaveTextContent('Sorting removed');
  });

  it('multi-sorts with Shift + click and Shift + Enter; aria-sort stays on the primary column', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const data = [
      { id: '1', name: 'B', role: 'Pilot', missions: 1 },
      { id: '2', name: 'A', role: 'Pilot', missions: 2 },
      { id: '3', name: 'C', role: 'Analyst', missions: 3 },
    ];
    render(
      <AnnouncerProvider>
        <DataTable caption="Crew" data={data} columns={columns} multiSort onSortChange={onSortChange} />
      </AnnouncerProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Role' }));
    screen.getByRole('button', { name: 'Name' }).focus();
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSortChange).toHaveBeenLastCalledWith([
      { key: 'role', direction: 'ascending' },
      { key: 'name', direction: 'ascending' },
    ]);
    expect(names()).toEqual(['C', 'A', 'B']);
    expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('button', { name: /Name/ }));
    await user.keyboard('{/Shift}');
    expect(names()).toEqual(['C', 'B', 'A']);
    await wait(150);
    expect(polite()).toHaveTextContent('Sorted by Role, ascending, then Name, descending');
    // A plain click replaces the multi-sort.
    await user.click(screen.getByRole('button', { name: /Missions/ }));
    expect(onSortChange).toHaveBeenLastCalledWith([{ key: 'missions', direction: 'ascending' }]);
  });

  it('is controlled through sort / onSortChange', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [sort, setSort] = useState<SortRule[]>([{ key: 'name', direction: 'descending' }]);
      return (
        <>
          <DataTable caption="Crew" data={crew} columns={columns} sort={sort} onSortChange={setSort} />
          <output>{JSON.stringify(sort)}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(names()[0]).toBe('Sally Ride');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(document.querySelector('output')).toHaveTextContent('[]');
    expect(names()[0]).toBe('Ada Lovelace');
  });

  it('uses a custom sortFn and sorts empty values last', () => {
    expect([3, null, 1, '', 2].sort(compareValues)).toEqual([1, 2, 3, null, '']);
    expect(['item 10', 'item 9'].sort(compareValues)).toEqual(['item 9', 'item 10']);
    render(
      <DataTable
        caption="Crew"
        data={crew}
        defaultSort={[{ key: 'name', direction: 'ascending' }]}
        columns={[{ key: 'name', header: 'Name', sortable: true, sortFn: (a, b) => a.name.length - b.name.length }]}
      />,
    );
    expect(names()[0]).toBe('Sally Ride');
  });
});

describe('DataTable filtering', () => {
  it('filters with the global search, resets the page and announces the result count', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderTable({ searchable: true, pagination: true, defaultPageSize: 2, defaultPage: 2, onPageChange });
    const search = screen.getByRole('searchbox', { name: 'Search Crew' });
    await user.type(search, 'an');
    expect(onPageChange).toHaveBeenCalledWith(1);
    // Matches the Role "Analyst".
    expect(names()).toEqual(['Ada Lovelace']);
    await wait(700);
    expect(polite()).toHaveTextContent('1 result');
    await user.clear(search);
    await user.type(search, 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
    await wait(700);
    expect(polite()).toHaveTextContent('0 results');
  });

  it('filters per column with labelled inputs', async () => {
    const user = userEvent.setup();
    const onColumnFiltersChange = vi.fn();
    renderTable({ onColumnFiltersChange });
    await user.type(screen.getByRole('searchbox', { name: 'Filter Role' }), 'pi');
    expect(onColumnFiltersChange).toHaveBeenLastCalledWith({ role: 'pi' });
    expect(names()).toEqual(['Sally Ride']);
  });

  it('supports a custom column filter and a controlled global filter', () => {
    render(
      <DataTable
        caption="Crew"
        data={crew}
        globalFilter="o"
        columnFilters={{ missions: '10' }}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'missions', header: 'Missions', filter: (row, q) => row.missions >= Number(q) },
        ]}
      />,
    );
    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']);
  });
});

describe('DataTable pagination', () => {
  it('pages rows with Pagination and a rows-per-page select', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    renderTable({ pagination: true, pageSizeOptions: [2, 4], onPageSizeChange });
    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']);
    expect(screen.getByText('1–2 of 5')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Crew pagination' });
    await user.click(within(nav).getByRole('button', { name: 'Page 3' }));
    expect(names()).toEqual(['Sally Ride']);
    expect(screen.getByText('5–5 of 5')).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '4');
    expect(onPageSizeChange).toHaveBeenCalledWith(4);
    expect(names()).toHaveLength(4);
    expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('clamps a page past the end', () => {
    renderTable({ pagination: true, page: 9, pageSize: 2 });
    expect(names()).toEqual(['Sally Ride']);
  });
});

describe('DataTable selection', () => {
  it('selects rows, drives an indeterminate select-all and announces counts', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ selectable: true, onSelectionChange });
    const all = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement;
    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['ada']);
    expect(all.indeterminate).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }).closest('tr')).toHaveAttribute('data-selected');
    await wait(150);
    expect(polite()).toHaveTextContent('1 row selected');
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['ada', 'grace', 'kat', 'mae', 'sally']);
    expect(all).toBeChecked();
    expect(all.indeterminate).toBe(false);
    await wait(150);
    expect(polite()).toHaveTextContent('5 rows selected');
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    await wait(150);
    expect(polite()).toHaveTextContent('No rows selected');
  });

  it('toggles with Space from the keyboard and uses getRowLabel', async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true, getRowLabel: (r) => `${r.name} (${r.role})` });
    const box = screen.getByRole('checkbox', { name: 'Select Grace Hopper (Captain)' });
    box.focus();
    await user.keyboard(' ');
    expect(box).toBeChecked();
  });

  it('select-all only touches the current page and keeps other pages selected', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ selectable: true, pagination: true, pageSize: 2, defaultSelectedIds: ['sally'], onSelectionChange });
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['sally', 'ada', 'grace']);
  });

  it('skips rows that are not selectable', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ selectable: true, isRowSelectable: (r) => r.id !== 'mae', onSelectionChange });
    expect(screen.getByRole('checkbox', { name: 'Select Mae Jemison' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['ada', 'grace', 'kat', 'sally']);
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeChecked();
  });

  it('is controlled through selectedIds', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [ids, setIds] = useState<string[]>(['kat']);
      return (
        <>
          <DataTable caption="Crew" data={crew} columns={columns} selectable selectedIds={ids} onSelectionChange={setIds} />
          <button type="button" onClick={() => setIds([])}>
            Clear
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('checkbox', { name: 'Select Katherine Johnson' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('checkbox', { name: 'Select Katherine Johnson' })).not.toBeChecked();
  });

  it('submits selected ids as hidden inputs with name', async () => {
    const user = userEvent.setup();
    let sent: string[] = [];
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sent = new FormData(e.currentTarget).getAll('crew') as string[];
        }}
      >
        <DataTable caption="Crew" data={crew} columns={columns} selectable name="crew" defaultSelectedIds={['grace']} />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Select Sally Ride' }));
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(sent).toEqual(['grace', 'sally']);
  });

  it('readOnly keeps the selection fixed but submits it; disabled blocks and skips submission', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const { container, rerender } = render(
      <DataTable caption="Crew" data={crew} columns={columns} selectable name="crew" readOnly invalid defaultSelectedIds={['ada']} onSelectionChange={onSelectionChange} />,
    );
    const ada = screen.getByRole('checkbox', { name: 'Select Ada Lovelace' });
    expect(ada).toHaveAttribute('aria-readonly', 'true');
    expect(ada).toHaveAttribute('aria-invalid', 'true');
    await user.click(ada);
    await user.click(screen.getByRole('checkbox', { name: 'Select Sally Ride' }));
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(ada).toBeChecked();
    expect(container.querySelectorAll('input[type="hidden"][name="crew"]')).toHaveLength(1);
    rerender(<DataTable caption="Crew" data={crew} columns={columns} selectable name="crew" disabled defaultSelectedIds={['ada']} />);
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeDisabled();
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  });
});

describe('DataTable column visibility', () => {
  it('hides and shows columns from the Columns menu', async () => {
    const user = userEvent.setup();
    const onHiddenColumnsChange = vi.fn();
    renderTable({ onHiddenColumnsChange });
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitemcheckbox').map((i) => i.textContent)).toEqual(['Role', 'Missions']);
    await user.click(within(menu).getByRole('menuitemcheckbox', { name: 'Missions' }));
    expect(onHiddenColumnsChange).toHaveBeenLastCalledWith(['missions']);
    expect(screen.queryByRole('columnheader', { name: 'Missions' })).not.toBeInTheDocument();
    // The menu stays open for more toggles; keyboard works too.
    const role = within(screen.getByRole('menu')).getByRole('menuitemcheckbox', { name: 'Role' });
    role.focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name']);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Columns' })).toHaveFocus();
  });

  it('never hides the last visible column', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        caption="Crew"
        data={crew}
        defaultHiddenColumns={['role']}
        columns={[
          { key: 'name', header: 'Name', hideable: true },
          { key: 'role', header: 'Role', hideable: true },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Role' })).toHaveAttribute('aria-checked', 'false');
  });
});

describe('DataTable server-side mode', () => {
  it('leaves data untouched and reports sort, filter and page changes', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onGlobalFilterChange = vi.fn();
    const onPageChange = vi.fn();
    const page = crew.slice(0, 2);
    const { rerender } = render(
      <AnnouncerProvider>
        <DataTable
          caption="Crew"
          data={page}
          columns={columns}
          manual
          searchable
          pagination
          pageSize={2}
          rowCount={40}
          onSortChange={onSortChange}
          onGlobalFilterChange={onGlobalFilterChange}
          onPageChange={onPageChange}
        />
      </AnnouncerProvider>,
    );
    expect(screen.getByText('1–2 of 40')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Name' }));
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith([{ key: 'name', direction: 'descending' }]);
    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']); // not re-sorted on the client
    await user.click(screen.getByRole('button', { name: 'Page 20' }));
    expect(onPageChange).toHaveBeenLastCalledWith(20);
    await user.type(screen.getByRole('searchbox', { name: 'Search Crew' }), 'zz');
    expect(onGlobalFilterChange).toHaveBeenLastCalledWith('zz');
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(names()).toHaveLength(2); // not filtered on the client
    // The server responds: loading, then the new total.
    const props = { caption: 'Crew', columns, manual: true, searchable: true, pagination: true, pageSize: 2 } as const;
    rerender(
      <AnnouncerProvider>
        <DataTable {...props} data={page} rowCount={40} loading />
      </AnnouncerProvider>,
    );
    await wait(150);
    expect(polite()).toHaveTextContent('Loading');
    rerender(
      <AnnouncerProvider>
        <DataTable {...props} data={[]} rowCount={0} />
      </AnnouncerProvider>,
    );
    await wait(700);
    expect(polite()).toHaveTextContent('0 results');
  });
});

describe('DataTable a11y', () => {
  it('has no axe violations in a full-featured state', async () => {
    const { container } = renderTable({
      selectable: true,
      searchable: true,
      pagination: true,
      pageSizeOptions: [2, 5],
      defaultSelectedIds: ['ada'],
      defaultSort: [{ key: 'name', direction: 'ascending' }],
      name: 'crew',
      stickyHeader: true,
      maxHeight: '20rem',
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations while loading or empty', async () => {
    const { container, rerender } = renderTable({ loading: true, selectable: true });
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <AnnouncerProvider>
        <DataTable caption="Crew" data={[]} columns={columns} selectable />
      </AnnouncerProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('forwards ref and rest props to the root', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<DataTable ref={ref} caption="Crew" data={crew} columns={columns} data-testid="dt" className="mine" />);
    expect(ref.current).toBe(screen.getByTestId('dt'));
    expect(ref.current).toHaveClass('os-data-table', 'mine');
  });
});

import { Table } from 'onesmallui';

const data = [
  ['#1042', 'Shipped', '$120.00'],
  ['#1043', 'Processing', '$89.50'],
  ['#1044', 'Shipped', '$42.00'],
  ['#1045', 'Refunded', '$15.25'],
];

// Striped rows or columns, hover, and an active row (data-state="active" adds a leading bar too).
export default function Example() {
  const head = (
    <thead>
      <tr>
        <th scope="col">Order</th>
        <th scope="col">Status</th>
        <th scope="col">Total</th>
      </tr>
    </thead>
  );
  const body = (activeRow?: number) => (
    <tbody>
      {data.map(([id, status, total], i) => (
        <tr key={id} data-state={i === activeRow ? 'active' : undefined} aria-current={i === activeRow || undefined}>
          <th scope="row">{id}</th>
          <td>{status}</td>
          <td>{total}</td>
        </tr>
      ))}
    </tbody>
  );
  return (
    <div className="os-grid os-gap-6 lg:os-grid-cols-2">
      <Table caption="Striped rows, hover, active row" striped hover size="sm">
        {head}
        {body(1)}
      </Table>
      <Table caption="Striped columns" striped="columns" size="sm">
        {head}
        {body()}
      </Table>
    </div>
  );
}

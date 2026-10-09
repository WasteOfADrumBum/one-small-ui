import { Table } from 'onesmallui';

function Rows() {
  return (
    <>
      <thead>
        <tr>
          <th scope="col">Planet</th>
          <th scope="col">Moons</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Earth</th>
          <td>1</td>
        </tr>
        <tr>
          <th scope="row">Mars</th>
          <td>2</td>
        </tr>
      </tbody>
    </>
  );
}

// Bordered, borderless, compact (size="sm") and card-like tables.
export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <Table caption="Bordered" bordered>
        <Rows />
      </Table>
      <Table caption="Borderless" borderless>
        <Rows />
      </Table>
      <Table caption="Compact" size="sm">
        <Rows />
      </Table>
      <Table caption="Card" variant="card" hover>
        <Rows />
      </Table>
    </div>
  );
}

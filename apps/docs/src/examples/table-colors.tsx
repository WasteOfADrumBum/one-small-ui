import { Table } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

// data-color on the table, a tbody, a row or a single cell gives it a soft tint.
// Body text keeps 7:1 contrast on every tint in both themes.
export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <Table caption="Row colors" size="sm">
        <thead>
          <tr>
            <th scope="col">Color</th>
            <th scope="col">Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">default</th>
            <td>No tint</td>
          </tr>
          {colors.map((c) => (
            <tr key={c} data-color={c}>
              <th scope="row">{c}</th>
              <td>
                Row with <code>data-color=&quot;{c}&quot;</code>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Table caption="A tinted table with one highlighted cell" color="info" size="sm">
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Seats</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Team</th>
            <td>10</td>
          </tr>
          <tr>
            <th scope="row">Business</th>
            <td data-color="success">50 (most popular)</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

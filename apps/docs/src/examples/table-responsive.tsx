import { Table } from 'onesmallui';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// responsive wraps the table in a focusable region (named by the caption), so keyboard
// users can scroll it with the arrow keys.
export default function Example() {
  return (
    <Table caption="Monthly active users (thousands)" responsive striped className="os-text-nowrap">
      <thead>
        <tr>
          <th scope="col">Region</th>
          {months.map((m) => (
            <th key={m} scope="col">
              {m}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {['Americas', 'Europe', 'Asia Pacific'].map((region, r) => (
          <tr key={region}>
            <th scope="row">{region}</th>
            {months.map((m, i) => (
              <td key={m}>{(120 + r * 40 + i * 7).toLocaleString()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

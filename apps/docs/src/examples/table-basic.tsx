import { Table } from 'onesmallui';

const rows = [
  { name: 'Ada Lovelace', role: 'Analyst', commits: 128 },
  { name: 'Grace Hopper', role: 'Compiler lead', commits: 342 },
  { name: 'Katherine Johnson', role: 'Navigation', commits: 97 },
];

// Always give a table a caption (its accessible name) and scope on header cells.
export default function Example() {
  return (
    <Table caption="Contributors this quarter">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col" className="os-text-end">
            Commits
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <th scope="row">{r.name}</th>
            <td>{r.role}</td>
            <td className="os-text-end">{r.commits}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            Total
          </th>
          <td className="os-text-end">567</td>
        </tr>
      </tfoot>
    </Table>
  );
}

import { Table } from 'onesmallui';

const people = [
  { name: 'Ada Lovelace', email: 'ada@example.com', team: 'Research', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@example.com', team: 'Security', status: 'Away' },
];

// Below md each row becomes a card. Table fills data-label from the header row and keeps
// table roles, so screen readers still announce rows and columns.
export default function Example() {
  return (
    <Table caption="Team directory (resize to stack)" stacked="md" variant="card">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Team</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {people.map((p) => (
          <tr key={p.email}>
            <th scope="row">{p.name}</th>
            <td>{p.email}</td>
            <td>{p.team}</td>
            <td>{p.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

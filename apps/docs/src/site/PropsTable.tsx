export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export function PropsTable({ title, props }: { title: string; props: PropDoc[] }) {
  return (
    <div className="docs-props">
      <table>
        <caption>{title} props</caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <th scope="row">
                <code>{p.name}</code>
              </th>
              <td>
                <code className="docs-props__type">{p.type}</code>
              </td>
              <td>{p.default ? <code>{p.default}</code> : <span aria-label="none">—</span>}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

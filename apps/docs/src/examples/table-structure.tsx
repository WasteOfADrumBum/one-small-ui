// Plain HTML: caption at the bottom, a row-group divider, vertical alignment and a nested table.
export default function Example() {
  return (
    <table className="os-table os-align-middle" data-caption="bottom">
      <caption>Release checklist, grouped by team. Captions can sit below the table.</caption>
      <thead>
        <tr>
          <th scope="col">Task</th>
          <th scope="col">Owner</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Changelog</th>
          <td className="os-align-top">Docs (top aligned)</td>
          <td>
            A long description that wraps onto several lines so you can see how the other cells in the row line up
            in the middle.
          </td>
        </tr>
      </tbody>
      <tbody data-divider>
        <tr>
          <th scope="row">Smoke tests</th>
          <td className="os-align-bottom">QA (bottom aligned)</td>
          <td>
            <table className="os-table" data-size="sm" data-borderless>
              <caption className="os-sr-only">Smoke test browsers</caption>
              <thead>
                <tr>
                  <th scope="col">Browser</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chrome</td>
                  <td>Pass</td>
                </tr>
                <tr>
                  <td>Safari</td>
                  <td>Pass</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

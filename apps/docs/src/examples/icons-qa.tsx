import { Table } from '@onesmall/ui';
import * as Icons from '@onesmall/ui/icons';
import type { IconComponent } from '@onesmall/ui/icons';

const all = Object.entries(Icons).filter(([name]) => /^[A-Z]\w+Icon$/.test(name)) as [string, IconComponent][];

// A faint 4px keyline grid on the 24×24 canvas, for checking alignment at lg.
const keylines = {
  display: 'inline-grid',
  outline: '1px solid var(--os-border)',
  backgroundImage:
    'linear-gradient(var(--os-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--os-grid-line) 1px, transparent 1px)',
  backgroundSize: '4px 4px',
};

// Every icon at every size, for reviewing stroke weight and optical alignment.
export default function Example() {
  return (
    <div style={{ maxHeight: '32rem', overflowY: 'auto' }} tabIndex={0} role="region" aria-label="Icon QA table">
      <Table caption={`All ${all.length} icons at sm, md and lg`} size="sm">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">sm (16px)</th>
            <th scope="col">md (20px)</th>
            <th scope="col">lg (24px)</th>
          </tr>
        </thead>
        <tbody>
          {all.map(([name, Glyph]) => (
            <tr key={name}>
              <th scope="row">
                <code>{name}</code>
              </th>
              <td>
                <Glyph size="sm" />
              </td>
              <td>
                <Glyph size="md" />
              </td>
              <td>
                <span style={keylines}>
                  <Glyph size="lg" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

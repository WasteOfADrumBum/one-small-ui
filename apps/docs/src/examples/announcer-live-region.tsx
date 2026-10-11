import { useState } from 'react';
import { Field, Input, LiveRegion } from '@onesmall/ui';

const crew = ['Ada', 'Grace', 'Katherine', 'Mae', 'Sally', 'Valentina', 'Yuri'];

// A visible live region: the result count is read after each change.
export default function Example() {
  const [query, setQuery] = useState('');
  const matches = crew.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="os-grid os-gap-3">
      <Field label="Filter crew">
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </Field>
      <LiveRegion visible className="os-text-sm os-text-muted">
        {matches.length === 1 ? '1 crew member' : `${matches.length} crew members`}
      </LiveRegion>
      <ul className="os-mb-0">
        {matches.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

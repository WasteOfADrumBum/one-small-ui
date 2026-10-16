import { useState } from 'react';
import { Button, EmptyState, Input } from '@onesmall/ui';

const crew = ['Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'];

export default function Example() {
  const [query, setQuery] = useState('zzz');
  const [failed, setFailed] = useState(true);
  const matches = crew.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="os-grid os-gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
      <EmptyState preset="no-data" headingLevel={4} />
      <EmptyState preset="first-use" headingLevel={4} actions={<Button>Invite crew</Button>} />
      <div>
        <Input aria-label="Search crew" value={query} onChange={(e) => setQuery(e.target.value)} />
        {matches.length ? (
          <ul>
            {matches.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <EmptyState preset="no-results" headingLevel={4} size="compact" onClearFilters={() => setQuery('')} />
        )}
      </div>
      {failed ? (
        <EmptyState preset="error" headingLevel={4} onRetry={() => setFailed(false)} />
      ) : (
        <p>
          Telemetry loaded. <Button variant="link" onClick={() => setFailed(true)}>Fail again</Button>
        </p>
      )}
    </div>
  );
}

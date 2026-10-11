import type { CSSProperties } from 'react';
import { Spinner } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-6">
      <Spinner
        label="Loading, slow and thick"
        style={{ '--os-spinner-size': '3rem', '--os-spinner-thickness': '5px', '--os-spinner-speed': '1.6s' } as CSSProperties}
      />
      <Spinner
        label="Loading, accent"
        style={{ '--os-spinner-size': '2.25rem', '--os-spinner-color': 'var(--os-accent-text)' } as CSSProperties}
      />
      <Spinner variant="grow" label="Loading, big dot" style={{ '--os-spinner-size': '3rem' } as CSSProperties} />
    </div>
  );
}

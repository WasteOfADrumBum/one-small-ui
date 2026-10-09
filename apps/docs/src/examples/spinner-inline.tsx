import { useState } from 'react';
import { Button, Spinner } from 'onesmallui';

export default function Example() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };
  return (
    <div className="os-grid os-gap-4">
      <p className="os-flex os-items-center os-gap-2">
        <Spinner size="sm" color="current" label={null} />
        <span role="status">Syncing telemetry…</span>
      </p>
      <div className="os-flex os-flex-wrap os-gap-3">
        {/* Button has a built-in loading state that shows a spinner and sets aria-busy. */}
        <Button loading={saving} loadingText="Saving" onClick={save}>
          Save flight plan
        </Button>
        <Button variant="soft" disabled>
          <Spinner variant="grow" label={null} />
          Waiting for clearance
        </Button>
        <Button variant="outline" aria-label="Refreshing" iconOnly disabled>
          <Spinner label={null} />
        </Button>
      </div>
    </div>
  );
}

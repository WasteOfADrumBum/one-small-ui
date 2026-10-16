import { Button, Popconfirm, Switch } from '@onesmall/ui';
import { useState } from 'react';

export default function Example() {
  const [fail, setFail] = useState(true);
  const [status, setStatus] = useState('Draft');
  // Stands in for a request to your API.
  const publish = () =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => (fail ? reject(new Error('The server is busy. Try again in a moment.')) : resolve()), 1200),
    ).then(() => setStatus('Published'));

  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Switch label="Fail the request" checked={fail} onChange={(e) => setFail(e.target.checked)} />
      <Popconfirm
        title="Publish the flight plan?"
        message="Everyone on the mission can see it."
        confirmLabel="Publish"
        loadingText="Publishing"
        onConfirm={publish}
      >
        <Button>Publish</Button>
      </Popconfirm>
      <span className="os-text-sm os-text-muted">Status: {status}</span>
    </div>
  );
}

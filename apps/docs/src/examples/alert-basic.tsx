import { useState } from 'react';
import { Alert, Button } from 'onesmallui';

export default function Example() {
  const [show, setShow] = useState(true);
  return (
    <div className="os-grid os-gap-3">
      <Alert color="info" title="Docking window opens soon">
        Crew should be at stations in 10 minutes.
      </Alert>
      <Alert color="success" title="Upload complete">
        All 12 files reached the archive.
      </Alert>
      <Alert color="warning" title="Solar flare detected">
        Non-essential systems will be paused.
      </Alert>
      {show ? (
        <Alert color="danger" title="Hull breach in sector 7" live="assertive" onDismiss={() => setShow(false)}>
          Seal the bulkhead before continuing.
        </Alert>
      ) : (
        <Button variant="soft" color="danger" onClick={() => setShow(true)}>
          Show dismissible alert
        </Button>
      )}
    </div>
  );
}

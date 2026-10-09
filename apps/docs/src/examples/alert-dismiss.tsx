import { useState } from 'react';
import { Alert, Button, useDisclosure } from 'onesmallui';

export default function Example() {
  // Uncontrolled: `dismissible` hides the alert itself; `onDismiss` lets you react.
  const [dismissed, setDismissed] = useState(0);
  // Controlled from code: `open` + `onOpenChange` (here via useDisclosure).
  const flare = useDisclosure(true);

  return (
    <div className="os-grid os-gap-3">
      <Alert color="warning" title="Solar flare detected" dismissible onDismiss={() => setDismissed((n) => n + 1)}>
        Non-essential systems will be paused. Dismiss me; I hide myself.
      </Alert>
      <p className="os-text-sm" aria-live="polite">
        Uncontrolled alerts dismissed: {dismissed}
      </p>

      <Alert
        color="danger"
        title="Hull breach in sector 7"
        open={flare.isOpen}
        onOpenChange={flare.setIsOpen}
        dismissLabel="Dismiss hull breach alert"
      >
        Seal the bulkhead before continuing.
      </Alert>
      <div className="os-flex os-gap-2">
        <Button variant="soft" color="danger" onClick={flare.open}>
          Show alert
        </Button>
        <Button variant="soft" onClick={flare.close}>
          Hide from code
        </Button>
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { Button, useFocusReturn } from '@onesmall/ui';

// When the confirmation closes, focus goes back to "Delete log" instead of the page top.
export default function Example() {
  const [confirming, setConfirming] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useFocusReturn({ active: confirming, container: box });

  return (
    <div className="os-grid os-gap-3">
      <div>
        <Button color="danger" variant="soft" onClick={() => setConfirming(true)} disabled={confirming}>
          Delete log
        </Button>
      </div>
      {confirming && (
        <div ref={box} role="group" aria-label="Confirm delete" className="os-flex os-flex-wrap os-items-center os-gap-2">
          <span>Delete the flight log for good?</span>
          <Button color="danger" autoFocus onClick={() => setConfirming(false)}>
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      )}
    </div>
  );
}

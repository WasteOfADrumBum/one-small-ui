import { useState } from 'react';
import { Button, Transition } from '@onesmall/ui';

// 'collapse' measures the content and animates its height, like Collapse.
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div className="os-grid os-gap-3">
      <div>
        <Button variant="soft" aria-expanded={open} aria-controls="checklist" onClick={() => setOpen((o) => !o)}>
          Pre-flight checklist
        </Button>
      </div>
      <Transition show={open} enter="collapse">
        <div id="checklist">
          <ol className="os-mb-0">
            <li>Seal the hatch</li>
            <li>Pressurise the cabin</li>
            <li>Arm the abort system</li>
          </ol>
        </div>
      </Transition>
    </div>
  );
}

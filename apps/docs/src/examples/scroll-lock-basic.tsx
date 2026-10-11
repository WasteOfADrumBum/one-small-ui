import { useState } from 'react';
import { Switch, useScrollLock } from '@onesmall/ui';

// Lock the page behind your own overlay. Dialog and Drawer already do this for you.
export default function Example() {
  const [locked, setLocked] = useState(false);
  useScrollLock(locked);
  return (
    <div className="os-grid os-gap-2">
      <Switch label="Lock page scroll" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
      <p className="os-text-sm os-text-muted os-mb-0">
        {locked ? 'Try scrolling: the page stays put and nothing shifts sideways.' : 'The page scrolls as usual.'}
      </p>
    </div>
  );
}

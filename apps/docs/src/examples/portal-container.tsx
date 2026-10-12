import { useState } from 'react';
import { Portal } from '@onesmall/ui';

// Render into a specific element instead of <body>. A state callback ref
// re-renders once the target exists; without a container, Portal uses <body>.
export default function Example() {
  const [tray, setTray] = useState<HTMLElement | null>(null);
  return (
    <div className="os-grid os-gap-3 md:os-grid-cols-2">
      <div className="os-p-4 os-rounded-lg os-bg-surface-2">
        <p className="os-mb-0">Defined here, in the first box.</p>
        {tray && (
          <Portal container={tray}>
            <p className="os-mb-0 os-font-semibold">Rendered in the tray.</p>
          </Portal>
        )}
      </div>
      <div ref={setTray} className="os-p-4 os-rounded-lg os-border" aria-label="Tray" role="group" />
    </div>
  );
}

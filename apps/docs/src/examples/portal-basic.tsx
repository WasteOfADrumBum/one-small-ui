import { useRef, useState } from 'react';
import { Button, Portal } from '@onesmall/ui';

// Rendered at the end of <body>, so no parent overflow or z-index can clip it.
export default function Example() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus(); // the banner is far away in the DOM: bring focus back
  };
  return (
    <>
      <Button ref={trigger} onClick={() => setOpen(true)}>Show banner</Button>
      {open && (
        <Portal>
          <div
            role="region"
            aria-label="Maintenance notice"
            className="os-fixed os-bottom-0 os-z-toast os-flex os-flex-wrap os-items-center os-gap-3 os-p-4 os-bg-surface os-border os-shadow-lg"
            style={{ insetInline: 0 }}
          >
            <span className="os-flex-1">Ground control is down for maintenance at 02:00 UTC.</span>
            <Button size="sm" variant="soft" autoFocus onClick={close}>
              Got it
            </Button>
          </div>
        </Portal>
      )}
    </>
  );
}

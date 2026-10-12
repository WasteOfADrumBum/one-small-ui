import { useRef, useState } from 'react';
import { Button, Field, Input, useFocusTrap } from '@onesmall/ui';

// A custom panel that keeps Tab inside it while open. Escape is up to you.
export default function Example() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, { active: open });

  if (!open) return <Button onClick={() => setOpen(true)}>Edit callsign</Button>;
  return (
    <div
      ref={panel}
      role="group"
      aria-label="Edit callsign"
      className="os-grid os-gap-3 os-p-4 os-rounded-lg os-border os-bg-surface"
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <Field label="Callsign">
        <Input defaultValue="Nova-7" />
      </Field>
      <div className="os-flex os-gap-2">
        <Button onClick={() => setOpen(false)}>Save</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

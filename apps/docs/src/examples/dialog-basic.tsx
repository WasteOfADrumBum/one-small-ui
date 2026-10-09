import { useState } from 'react';
import { Button, Dialog, Field, Input } from 'onesmallui';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Rename vessel</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rename vessel"
        description="This name appears on every crew manifest."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <Field label="Vessel name">
          <Input defaultValue="Starlight Runner" autoFocus />
        </Field>
      </Dialog>
    </>
  );
}

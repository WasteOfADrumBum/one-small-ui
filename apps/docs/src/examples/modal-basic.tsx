import { useState } from 'react';
import { Button, Field, Input, Modal } from 'onesmallui';

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal
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
      </Modal>
    </>
  );
}

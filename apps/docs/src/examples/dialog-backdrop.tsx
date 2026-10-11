import { useRef, useState } from 'react';
import { Button, Dialog } from 'onesmallui';

export default function Example() {
  const [open, setOpen] = useState(false);
  const confirm = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button color="danger" variant="soft" onClick={() => setOpen(true)}>
        Eject cargo
      </Button>
      {/* Static backdrop: clicking outside nudges the dialog instead of closing it. */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdrop="static"
        initialFocus={confirm}
        size="sm"
        title="Eject all cargo?"
        description="This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Keep cargo
            </Button>
            <Button ref={confirm} color="danger" onClick={() => setOpen(false)}>
              Eject
            </Button>
          </>
        }
      >
        <p>All 42 containers will be released into space.</p>
      </Dialog>
    </>
  );
}

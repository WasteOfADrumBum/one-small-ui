import { useState } from 'react';
import { Button, Dialog } from 'onesmallui';

// modal={false} uses show() instead of showModal(): no backdrop,
// the page stays interactive, and Escape still closes it.
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide' : 'Show'} flight log
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        size="sm"
        title="Flight log"
        description="Keeps floating while you work."
      >
        <p>Jump 14 complete. Fuel at 61%.</p>
      </Dialog>
    </>
  );
}

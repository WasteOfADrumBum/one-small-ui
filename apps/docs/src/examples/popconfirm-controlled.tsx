import { Button, Popconfirm } from '@onesmall/ui';
import { useState } from 'react';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('none yet');
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Popconfirm
        open={open}
        onOpenChange={setOpen}
        title="Restart the scanner?"
        message="The current scan stops and starts again from the top."
        confirmLabel="Restart"
        initialFocus="confirm"
        onConfirm={() => setAnswer('restarted')}
        onCancel={() => setAnswer('cancelled')}
      >
        <Button variant="outline">Restart scanner</Button>
      </Popconfirm>
      <span className="os-text-sm os-text-muted">
        {open ? 'Open' : 'Closed'}. Last answer: {answer}
      </span>
    </div>
  );
}

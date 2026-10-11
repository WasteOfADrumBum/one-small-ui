import { useState } from 'react';
import { Button, Field, Select, ToastProvider, useToast, type ToastPlacement } from 'onesmallui';

const placements: ToastPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

function Trigger({ placement }: { placement: ToastPlacement }) {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: `Hello from ${placement}`, duration: 4000 })}>Show toast</Button>;
}

export default function Example() {
  const [placement, setPlacement] = useState<ToastPlacement>('top-center');
  return (
    <ToastProvider placement={placement} label="Placement demo notifications">
      <div className="os-flex os-flex-wrap os-items-end os-gap-3">
        <Field label="Placement">
          <Select value={placement} onChange={(e) => setPlacement(e.target.value as ToastPlacement)}>
            {placements.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Trigger placement={placement} />
      </div>
    </ToastProvider>
  );
}

import { useState } from 'react';
import { Button, Dialog, type DialogProps } from 'onesmallui';

type Option = { label: string; size?: DialogProps['size']; fullscreen?: DialogProps['fullscreen'] };

const options: Option[] = [
  { label: 'Small', size: 'sm' },
  { label: 'Large', size: 'lg' },
  { label: 'Extra large', size: 'xl' },
  { label: 'Fullscreen', fullscreen: true },
  { label: 'Fullscreen below md', fullscreen: 'md' },
  { label: 'Fullscreen below lg', fullscreen: 'lg' },
];

export default function Example() {
  const [current, setCurrent] = useState<Option | null>(null);
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      {options.map((o) => (
        <Button key={o.label} variant="outline" onClick={() => setCurrent(o)}>
          {o.label}
        </Button>
      ))}
      <Dialog
        open={current !== null}
        onClose={() => setCurrent(null)}
        size={current?.size}
        fullscreen={current?.fullscreen}
        title={current?.label ?? ''}
      >
        <p>Resize the window to see responsive fullscreen dialogs switch at their breakpoint.</p>
      </Dialog>
    </div>
  );
}

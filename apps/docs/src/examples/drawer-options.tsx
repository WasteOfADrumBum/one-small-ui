import { useState } from 'react';
import { Button, Drawer, type DrawerProps } from 'onesmallui';

type Option = { label: string; props: Partial<DrawerProps> };

const options: Option[] = [
  { label: 'Sheet', props: { sheet: true } },
  { label: 'Bottom sheet', props: { sheet: true, placement: 'bottom' } },
  { label: 'Body scrolling', props: { modal: false } },
  { label: 'Static backdrop', props: { backdrop: 'static' } },
  { label: 'Instant', props: { instant: true } },
  { label: 'Dark', props: { appearance: 'dark' } },
  { label: 'Translucent', props: { appearance: 'translucent', sheet: true } },
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
      <Drawer
        open={current !== null}
        onClose={() => setCurrent(null)}
        title={current?.label ?? ''}
        {...current?.props}
      >
        {current?.props.modal === false ? (
          <p>Non-modal: the page behind still scrolls and responds to clicks. Escape or × closes it.</p>
        ) : (
          <p>Press Escape, use the close button, or click outside{current?.props.backdrop === 'static' ? ' (it will nudge)' : ''}.</p>
        )}
      </Drawer>
    </div>
  );
}

import { useState } from 'react';
import { Button, Drawer, type DrawerPlacement } from 'onesmallui';

// start/end follow the text direction (they swap in RTL); left/right are physical.
const placements: DrawerPlacement[] = ['start', 'end', 'top', 'bottom'];

export default function Example() {
  const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      {placements.map((p) => (
        <Button key={p} variant="outline" onClick={() => setPlacement(p)}>
          Open {p}
        </Button>
      ))}
      <Drawer
        open={placement !== null}
        onClose={() => setPlacement(null)}
        placement={placement ?? 'end'}
        title="Mission control"
        description={`Sliding in from the ${placement ?? 'end'}.`}
        footer={<Button onClick={() => setPlacement(null)}>Done</Button>}
      >
        <p>Header, body and footer: the body scrolls, the header and footer stay put.</p>
      </Drawer>
    </div>
  );
}

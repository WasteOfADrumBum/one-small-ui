import { useState } from 'react';
import { Button, Modal } from 'onesmallui';

type Placement = 'left' | 'right' | 'bottom';

export default function Example() {
  const [placement, setPlacement] = useState<Placement | null>(null);
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      {(['left', 'right', 'bottom'] as const).map((p) => (
        <Button key={p} variant="outline" onClick={() => setPlacement(p)}>
          Open {p}
        </Button>
      ))}
      <Modal
        open={placement !== null}
        onClose={() => setPlacement(null)}
        placement={placement ?? 'right'}
        size="sm"
        title="Navigation"
        description={`A drawer sliding in from the ${placement ?? 'right'}.`}
      >
        <p>Drawers and bottom sheets use the same accessible dialog under the hood.</p>
      </Modal>
    </div>
  );
}

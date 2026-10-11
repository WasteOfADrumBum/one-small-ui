import { useState } from 'react';
import { Button } from 'onesmallui';

export default function Example() {
  const [muted, setMuted] = useState(false);
  return (
    <div className="os-grid os-gap-4">
      <div className="os-flex os-flex-wrap os-items-center os-gap-3">
        <Button shape="pill">Pill</Button>
        <Button shape="square" variant="outline">
          Square
        </Button>
        <Button shape="pill" variant="soft" color="accent">
          Soft pill
        </Button>
      </div>
      <div className="os-flex os-flex-wrap os-items-center os-gap-3">
        <Button variant="outline" active>
          Active
        </Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" color="secondary" pressed={muted} onClick={() => setMuted((m) => !m)}>
          {muted ? 'Muted' : 'Mute'}
        </Button>
      </div>
    </div>
  );
}

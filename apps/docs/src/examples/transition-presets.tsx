import { useState } from 'react';
import { Button, Card, CardBody, Field, Select, Transition, transitionPresets, type TransitionPreset } from '@onesmall/ui';

export default function Example() {
  const [show, setShow] = useState(true);
  const [preset, setPreset] = useState<TransitionPreset>('fade');
  return (
    <div className="os-grid os-gap-4">
      <div className="os-flex os-flex-wrap os-items-end os-gap-3">
        <Field label="Preset">
          <Select value={preset} onChange={(e) => setPreset(e.target.value as TransitionPreset)}>
            {transitionPresets.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Button aria-expanded={show} aria-controls="docking-card" onClick={() => setShow((s) => !s)}>
          {show ? 'Hide card' : 'Show card'}
        </Button>
      </div>
      <Transition show={show} enter={preset}>
        <Card id="docking-card">
          <CardBody>Docking port 2 is clear. Approach at 0.1 m/s.</CardBody>
        </Card>
      </Transition>
    </div>
  );
}

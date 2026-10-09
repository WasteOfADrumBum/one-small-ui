import { useState } from 'react';
import { Field, Range } from 'onesmallui';

export default function Example() {
  const [thrust, setThrust] = useState(40);
  return (
    <div className="os-grid os-gap-8 md:os-grid-cols-2">
      <Field label="Thrust" hint={`Engines at ${thrust}%.`}>
        <Range value={thrust} onValueChange={setThrust} showValue showMinMax formatValue={(v) => `${v}%`} />
      </Field>
      <Field label="Cabin temperature">
        <Range min={16} max={28} step={0.5} defaultValue={21} showValue showMinMax formatValue={(v) => `${v} °C`} />
      </Field>
    </div>
  );
}

import { useState } from 'react';
import { Field, NumberInput } from '@onesmall/ui';

export default function Example() {
  const [crew, setCrew] = useState<number | null>(4);
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Crew size" description={`Between 1 and 12. Current: ${crew ?? 'empty'}`}>
        <NumberInput value={crew} onValueChange={setCrew} min={1} max={12} />
      </Field>
      <Field label="Fuel reserve" description="Steps of 0.5 tonnes; Page Up/Down jump 5.">
        <NumberInput defaultValue={12.5} step={0.5} min={0} endAdornment="t" />
      </Field>
      <Field label="Docking bay" readOnly>
        <NumberInput defaultValue={7} size="sm" />
      </Field>
      <Field label="Airlock cycles" disabled>
        <NumberInput defaultValue={3} />
      </Field>
    </div>
  );
}

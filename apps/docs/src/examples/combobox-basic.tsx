import { useState } from 'react';
import { Combobox, Field } from 'onesmallui';

const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((p) => ({
  value: p.toLowerCase(),
  label: p,
}));

export default function Example() {
  const [planet, setPlanet] = useState<string | null>('mars');
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Home planet" hint={`Selected: ${planet ?? 'none'}`}>
        <Combobox options={planets} value={planet} onValueChange={setPlanet} placeholder="Search planets" />
      </Field>
      <Field label="Planets visited">
        <Combobox multiple options={planets} defaultValue={['earth', 'mars']} placeholder="Add planets" />
      </Field>
      <Field label="Orbit (select-only)">
        <Combobox searchable={false} size="sm" options={planets.slice(0, 4)} placeholder="Choose" />
      </Field>
      <Field label="Disabled" disabled>
        <Combobox options={planets} defaultValue="venus" />
      </Field>
    </div>
  );
}

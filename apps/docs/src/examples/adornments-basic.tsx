import { useState, type CSSProperties } from 'react';
import { Field, Input, Select } from 'onesmallui';

const Search = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function Example() {
  const [show, setShow] = useState(false);
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Search crew">
        <Input type="search" startAdornment={<Search />} />
      </Field>
      <Field label="Cargo weight" hint="Text adornments are announced with the field.">
        <Input type="number" startAdornment="≈" endAdornment="kg" />
      </Field>
      <Field label="Password">
        <Input
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          endAdornment={
            <button type="button" aria-pressed={show} onClick={() => setShow(!show)}>
              {show ? 'Hide' : 'Show'}
            </button>
          }
        />
      </Field>
      <Field label="Sector">
        <Select startAdornment={<Search />} options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]} />
      </Field>
      <Field label="Large icon (--os-adornment-size)">
        <Input size="lg" startAdornment={<Search />} style={{ '--os-adornment-size': '1.5rem' } as CSSProperties} />
      </Field>
      <Field label="Small with unit">
        <Input size="sm" endAdornment="AU" />
      </Field>
    </div>
  );
}

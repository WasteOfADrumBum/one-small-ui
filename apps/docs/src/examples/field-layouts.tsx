import { Field, Input, Select } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8 lg:os-grid-cols-2">
      <div className="os-grid os-gap-4">
        <Field label="Callsign" hint="Label above the control (default).">
          <Input placeholder="Nova-7" />
        </Field>
        <Field label="Quantity" layout="inline">
          <Input type="number" defaultValue={2} style={{ maxWidth: '8rem' }} />
        </Field>
      </div>
      <div className="os-grid os-gap-4">
        <Field label="First name" layout="horizontal" labelWidth="8rem">
          <Input autoComplete="given-name" />
        </Field>
        <Field label="Role" layout="horizontal" labelWidth="8rem" hint="Labels sit beside controls from sm up.">
          <Select options={[{ value: 'pilot', label: 'Pilot' }, { value: 'eng', label: 'Engineer' }]} />
        </Field>
      </div>
    </div>
  );
}

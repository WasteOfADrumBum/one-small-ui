import { Field, Input, Select, Textarea } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Disabled input" disabled>
        <Input defaultValue="Can't touch this" />
      </Field>
      <Field label="Disabled select" disabled>
        <Select options={[{ value: 'x', label: 'Locked' }]} />
      </Field>
      <Field label="Read-only input" hint="Selectable and copyable, but not editable.">
        <Input readOnly defaultValue="NOVA-7781" />
      </Field>
      <Field label="Read-only textarea">
        <Textarea readOnly rows={2} defaultValue="Logged by the flight computer." />
      </Field>
      <Field label="Account" layout="horizontal" labelWidth="7rem">
        <Input variant="plaintext" defaultValue="ada@station.io" />
      </Field>
      <Field label="Password" layout="horizontal" labelWidth="7rem" hint="At least 12 characters.">
        <Input type="password" autoComplete="new-password" />
      </Field>
    </div>
  );
}

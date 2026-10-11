import { Field, FieldGroup, Input, Select } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6 lg:os-grid-cols-2">
      <FieldGroup legend="Contact" description="How mission control reaches you.">
        <Field label="Email">
          <Input type="email" autoComplete="email" />
        </Field>
        <Field label="Phone">
          <Input type="tel" autoComplete="tel" />
        </Field>
      </FieldGroup>

      <FieldGroup legend="Shipping address" variant="card" layout="grid" minItemWidth="10rem">
        <Field label="Street" className="os-col-span-full">
          <Input autoComplete="street-address" />
        </Field>
        <Field label="City">
          <Input autoComplete="address-level2" />
        </Field>
        <Field label="Orbit">
          <Select options={[{ value: 'leo', label: 'Low' }, { value: 'geo', label: 'Geostationary' }]} />
        </Field>
      </FieldGroup>
    </div>
  );
}

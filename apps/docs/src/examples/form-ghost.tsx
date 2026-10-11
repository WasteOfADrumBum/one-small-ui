import { Field, Input, Select, Textarea } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <Field label="Title">
        <Input variant="ghost" defaultValue="Untitled mission" />
      </Field>
      <Field label="Status">
        <Select
          variant="ghost"
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'live', label: 'Live' },
          ]}
        />
      </Field>
      <Field label="Notes">
        <Textarea variant="ghost" rows={1} placeholder="Add a note" />
      </Field>
    </div>
  );
}

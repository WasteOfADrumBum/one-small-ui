import { Field, Input } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 sm:os-grid-cols-2 lg:os-grid-cols-3">
      <Field label="Launch date">
        <Input type="date" defaultValue="2026-10-09" />
      </Field>
      <Field label="Launch time">
        <Input type="time" defaultValue="09:30" />
      </Field>
      <Field label="Docking window">
        <Input type="datetime-local" defaultValue="2026-10-09T14:00" />
      </Field>
      <Field label="Billing month">
        <Input type="month" defaultValue="2026-10" />
      </Field>
      <Field label="Shift week">
        <Input type="week" defaultValue="2026-W41" />
      </Field>
      <Field label="Hull color">
        <Input type="color" defaultValue="#00557a" />
      </Field>
      <Field label="Flight plan" hint="PDF or image, up to 5 MB." className="sm:os-col-span-full">
        <Input type="file" accept=".pdf,image/*" />
      </Field>
    </div>
  );
}

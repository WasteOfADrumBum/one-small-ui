import { Field, NumberInput } from '@onesmall/ui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Ticket price" description="Shows $1,234.50 when blurred, 1234.5 while editing.">
        <NumberInput
          defaultValue={1234.5}
          min={0}
          step={0.01}
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD' }}
        />
      </Field>
      <Field label="Crew discount" description="Percent follows Intl: the value 0.15 shows as 15%.">
        <NumberInput defaultValue={0.15} min={0} max={0.5} formatOptions={{ style: 'percent' }} />
      </Field>
      <Field label="Orbit altitude" description="German formatting: type 1.250,5 or 1250,5.">
        <NumberInput defaultValue={1250.5} locale="de-DE" formatOptions={{ style: 'unit', unit: 'kilometer' }} />
      </Field>
      <Field label="Thrust" description="Scroll to adjust while focused.">
        <NumberInput defaultValue={60} min={0} max={100} allowWheel endAdornment="%" />
      </Field>
    </div>
  );
}

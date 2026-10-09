import { Field, Input, Select, Textarea } from 'onesmallui';

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-4 sm:os-grid-cols-2 lg:os-grid-cols-4">
      {sizes.map((size) => (
        <Field key={size} label={`Input ${size}`}>
          <Input size={size} placeholder={`Size ${size}`} />
        </Field>
      ))}
      {sizes.map((size) => (
        <Field key={size} label={`Select ${size}`}>
          <Select size={size} options={[{ value: '1', label: `Size ${size}` }]} />
        </Field>
      ))}
      <Field label="Textarea sm" className="lg:os-col-span-2">
        <Textarea size="sm" rows={2} />
      </Field>
      <Field label="Textarea lg" className="lg:os-col-span-2">
        <Textarea size="lg" rows={2} />
      </Field>
    </div>
  );
}

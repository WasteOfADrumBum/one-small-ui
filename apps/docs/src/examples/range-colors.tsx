import { Field, Range, type ThemeColor } from 'onesmallui';

const colors: ThemeColor[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      {colors.map((c, i) => (
        <Field key={c} label={`${c} range`}>
          <Range color={c} defaultValue={20 + i * 10} />
        </Field>
      ))}
      <Field label="Small">
        <Range size="sm" defaultValue={30} />
      </Field>
      <Field label="Large">
        <Range size="lg" defaultValue={70} />
      </Field>
      <Field label="Disabled" disabled>
        <Range defaultValue={50} />
      </Field>
    </div>
  );
}

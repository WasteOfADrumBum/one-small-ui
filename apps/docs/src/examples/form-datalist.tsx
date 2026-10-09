import { Field, Input } from 'onesmallui';

export default function Example() {
  return (
    <Field label="Destination" hint="Pick a suggestion or type your own." style={{ maxWidth: '24rem' }}>
      <Input suggestions={['Mars', 'Europa', 'Titan', 'Ganymede', 'Ceres']} placeholder="Start typing…" />
    </Field>
  );
}

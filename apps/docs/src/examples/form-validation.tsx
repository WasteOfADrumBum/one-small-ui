import { useState } from 'react';
import { Button, Checkbox, Field, Form, Input } from 'onesmallui';

export default function Example() {
  const [status, setStatus] = useState('');
  return (
    <Form
      aria-label="Register"
      layout="grid"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus('Registered!');
      }}
      onInvalidSubmit={() => setStatus('Please fix the highlighted fields.')}
    >
      <Field label="Callsign" required hint="3–12 letters.">
        <Input minLength={3} maxLength={12} pattern="[A-Za-z]+" />
      </Field>
      <Field label="Email" required>
        <Input type="email" autoComplete="email" />
      </Field>
      <Field label="Age" hint="Pilots must be 18+.">
        <Input type="number" min={18} max={120} />
      </Field>
      <Field label="Website">
        <Input type="url" placeholder="https://" />
      </Field>
      <Checkbox label="I accept the flight rules" required className="os-col-span-full" />
      <div className="os-flex os-items-center os-gap-3 os-col-span-full">
        <Button type="submit">Register</Button>
        <Button type="reset" variant="ghost" onClick={() => setStatus('')}>
          Reset
        </Button>
        <span role="status">{status}</span>
      </div>
    </Form>
  );
}

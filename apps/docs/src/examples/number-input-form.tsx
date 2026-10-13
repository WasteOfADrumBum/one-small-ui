import { useState } from 'react';
import { Button, Field, Form, NumberInput } from '@onesmall/ui';

export default function Example() {
  const [submitted, setSubmitted] = useState('');
  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const entries = [...new FormData(e.currentTarget)].map(([key, value]) => `${key}=${String(value)}`);
        setSubmitted(entries.join(', '));
      }}
    >
      <Field label="Cargo weight" description="Rounded to 2 decimals, clamped to 0–500 kg on blur." required>
        <NumberInput name="weight" min={0} max={500} precision={2} endAdornment="kg" />
      </Field>
      <Field label="Budget">
        <NumberInput name="budget" defaultValue={2500} locale="en-US" formatOptions={{ style: 'currency', currency: 'USD' }} />
      </Field>
      <div className="os-flex os-gap-2">
        <Button type="submit">Book cargo</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <output aria-live="polite">{submitted && `Submitted: ${submitted}`}</output>
    </Form>
  );
}

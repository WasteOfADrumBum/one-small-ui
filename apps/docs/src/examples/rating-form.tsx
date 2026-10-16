import { useState, type FormEvent } from 'react';
import { Button, Field, Form, Rating, Textarea } from '@onesmall/ui';

export default function Example() {
  const [sent, setSent] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(`service=${data.get('service')}, food=${data.get('food') ?? 'none'}`);
  };
  return (
    <Form onSubmit={onSubmit} style={{ maxWidth: '32rem' }}>
      <Field label="Service" hint="1 is poor, 5 is excellent." required>
        <Rating name="service" />
      </Field>
      <Field label="Food" hint="Optional. Choose the same rating again to clear it.">
        <Rating name="food" precision={0.5} allowClear />
      </Field>
      <Field label="Average from other guests" readOnly>
        <Rating defaultValue={4.2} precision={0.5} />
      </Field>
      <Field label="Comments">
        <Textarea name="comments" autoResize />
      </Field>
      <div className="os-flex os-items-center os-gap-3">
        <Button type="submit">Send review</Button>
        <span aria-live="polite">{sent && `Submitted ${sent}`}</span>
      </div>
    </Form>
  );
}

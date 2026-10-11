import { useState } from 'react';
import { Field, OtpInput } from 'onesmallui';

export default function Example() {
  const [code, setCode] = useState('');
  const wrong = code.length === 6 && code !== '123456';
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <Field label="Verification code" hint="Sent to your comms unit. Try 123456." error={wrong ? 'That code is not right.' : undefined}>
        <OtpInput name="code" value={code} onValueChange={setCode} groupSize={3} />
      </Field>
      <Field label="PIN" hint="Masked, connected slots.">
        <OtpInput length={4} mask variant="connected" size="lg" />
      </Field>
      <Field label="Ticket code" hint="Letters and digits.">
        <OtpInput length={5} type="alphanumeric" size="sm" variant="connected" groupSize={5} />
      </Field>
      <Field label="Locked code" disabled>
        <OtpInput length={4} defaultValue="42" />
      </Field>
    </div>
  );
}

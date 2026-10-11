import { useId, useState } from 'react';
import { Field, Input, PasswordStrength } from 'onesmallui';

export default function Example() {
  const [pw, setPw] = useState('');
  const meterId = useId();
  return (
    <div className="os-grid os-gap-8 md:os-grid-cols-2">
      <div className="os-grid os-gap-3">
        <Field label="New password">
          <Input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby={meterId} />
        </Field>
        <PasswordStrength id={meterId} value={pw} showRules />
      </div>
      <div className="os-grid os-gap-3">
        <PasswordStrength value="orbit" variant="bar" meterLabel="Example: orbit" />
        <PasswordStrength
          value="Orbit-2026!"
          variant="bar"
          meterLabel="Custom rules: Orbit-2026!"
          rules={[
            { id: 'len', label: '10+ characters', test: (p) => p.length >= 10 },
            { id: 'year', label: 'Contains a year', test: /\d{4}/ },
          ]}
          showRules
        />
      </div>
    </div>
  );
}

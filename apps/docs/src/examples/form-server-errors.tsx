import { useState, type CSSProperties } from 'react';
import { Button, Field, Form, Input } from 'onesmallui';

// Pretend server: "nova" is taken.
const check = async (name: string) => (name.toLowerCase() === 'nova' ? { username: 'That username is taken.' } : {});

export default function Example() {
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [ok, setOk] = useState(false);
  return (
    <Form
      aria-label="Claim a username"
      layout="inline"
      // Custom validation colors through CSS variables.
      style={{ '--os-valid-color': 'var(--os-info-text)' } as CSSProperties}
      onSubmit={async (e) => {
        e.preventDefault();
        const name = new FormData(e.currentTarget).get('username') as string;
        const result = await check(name);
        setErrors(result);
        setOk(!result.username);
      }}
    >
      <Field label="Username" feedback="tooltip" error={errors.username} success={ok ? 'Yours!' : undefined}>
        <Input name="username" defaultValue="nova" required onChange={() => setOk(false)} />
      </Field>
      <Button type="submit">Claim</Button>
    </Form>
  );
}

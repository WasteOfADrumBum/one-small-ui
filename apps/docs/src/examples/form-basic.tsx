import { useState, type FormEvent } from 'react';
import { Button, Field, Input, Select, Textarea } from 'onesmallui';

const Mail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export default function Example() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter an email like pilot@station.io' : undefined;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Call sign" hint="Shown to your crew." required>
        <Input placeholder="Nova-7" autoComplete="nickname" />
      </Field>
      <Field label="Email" error={emailError} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startAdornment={<Mail />}
          autoComplete="email"
        />
      </Field>
      <Field label="Sector">
        <Select
          placeholder="Choose a sector"
          options={[
            { value: 'alpha', label: 'Alpha Quadrant' },
            { value: 'beta', label: 'Beta Quadrant' },
            { value: 'gamma', label: 'Gamma Quadrant' },
          ]}
        />
      </Field>
      <Field label="Budget" hint="In credits.">
        <Input type="number" inputMode="numeric" endAdornment="CR" defaultValue={1200} />
      </Field>
      <Field label="Mission notes" className="md:os-col-span-full">
        <Textarea autoResize placeholder="Type and watch me grow…" />
      </Field>
      <div className="os-flex os-gap-3 md:os-col-span-full">
        <Button type="submit">Submit</Button>
        <Button type="reset" variant="ghost" onClick={() => {
            setSubmitted(false);
            setEmail('');
          }}>
          Reset
        </Button>
      </div>
    </form>
  );
}

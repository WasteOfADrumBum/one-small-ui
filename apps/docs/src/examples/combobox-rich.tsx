import { useState, type FormEvent } from 'react';
import { Button, Combobox, Field } from 'onesmallui';

const Dot = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const crew = [
  { value: 'ada', label: 'Ada Lovelace', description: 'Navigator', group: 'Bridge', icon: <Dot /> },
  { value: 'grace', label: 'Grace Hopper', description: 'Captain', group: 'Bridge', icon: <Dot /> },
  { value: 'kat', label: 'Katherine Johnson', description: 'Orbital mechanics', group: 'Engineering', icon: <Dot /> },
  { value: 'mae', label: 'Mae Jemison', description: 'Medical officer, on leave', group: 'Medical', icon: <Dot />, disabled: true },
];

export default function Example() {
  const [sent, setSent] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(new FormData(e.currentTarget).getAll('crew').join(', '));
  };
  return (
    <form onSubmit={onSubmit} className="os-grid os-gap-4" style={{ maxWidth: '28rem' }}>
      <Field label="Away team" hint="Grouped options with icons and descriptions.">
        <Combobox name="crew" multiple size="lg" options={crew} placeholder="Search crew" />
      </Field>
      <div className="os-flex os-items-center os-gap-3">
        <Button type="submit">Submit</Button>
        <span aria-live="polite">{sent && `Submitted crew=${sent}`}</span>
      </div>
    </form>
  );
}

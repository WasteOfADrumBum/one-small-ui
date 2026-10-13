import { useState, type FormEvent } from 'react';
import { Button, Field, Form, TagInput } from '@onesmall/ui';

const skills = ['Accessibility', 'Design systems', 'Prototyping', 'Research', 'React', 'TypeScript', 'Writing'];

const teams = [
  { value: 'core', label: 'Core platform', description: '12 people' },
  { value: 'growth', label: 'Growth', description: '8 people' },
  { value: 'mobile', label: 'Mobile', description: '6 people' },
  { value: 'infra', label: 'Infrastructure', description: 'Closed to new members', disabled: true },
];

export default function Example() {
  const [sent, setSent] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(`skills=${data.getAll('skills').join(', ')}; teams=${data.getAll('teams').join(', ')}`);
  };
  return (
    <Form onSubmit={onSubmit} style={{ maxWidth: '32rem' }}>
      <Field label="Skills" description="Pick a suggestion or type your own.">
        <TagInput name="skills" suggestions={skills} defaultValue={['React']} placeholder="Add a skill" />
      </Field>
      <Field label="Teams" description="Only existing teams can be chosen." required>
        <TagInput name="teams" suggestions={teams} mode="suggestions-only" placeholder="Search teams" />
      </Field>
      <div className="os-flex os-items-center os-gap-3">
        <Button type="submit">Save</Button>
        <span aria-live="polite">{sent && `Submitted ${sent}`}</span>
      </div>
    </Form>
  );
}

import { Field, TagInput } from '@onesmall/ui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Topics" description="Press Enter or comma to add. Paste a list to add many.">
        <TagInput name="topics" defaultValue={['Design', 'Research']} placeholder="Add a topic" />
      </Field>
      <Field label="Invite by email" description="Up to 3 people.">
        <TagInput
          name="invite"
          maxTags={3}
          placeholder="name@example.com"
          validate={(tag) => /^\S+@\S+\.\S+$/.test(tag) || 'Enter a valid email address.'}
        />
      </Field>
      <Field label="Labels (read only)" readOnly>
        <TagInput defaultValue={['Urgent', 'Billing']} />
      </Field>
      <Field label="Labels (disabled)" disabled>
        <TagInput defaultValue={['Archived']} size="sm" />
      </Field>
    </div>
  );
}

import { Chip, ChipGroup, ChipInput, Field } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <ChipGroup aria-label="Filter by status" selectionMode="multiple" defaultValue={['Active']}>
        <Chip>Active</Chip>
        <Chip>Docked</Chip>
        <Chip>Lost</Chip>
        <Chip disabled>Archived</Chip>
      </ChipGroup>
      <ChipGroup aria-label="Sort by" selectionMode="single" defaultValue={['Newest']} color="accent">
        <Chip>Newest</Chip>
        <Chip>Oldest</Chip>
      </ChipGroup>
      <div className="os-grid os-gap-4 md:os-grid-cols-2">
        <Field label="Crew emails" hint="Press Enter or comma to add. Backspace removes the last one.">
          <ChipInput
            name="crew"
            defaultValue={['ada@station.io']}
            placeholder="Add email"
            validate={(v) => /^\S+@\S+$/.test(v) || 'Enter a valid email.'}
          />
        </Field>
        <Field label="Tags (empty, disabled)" disabled>
          <ChipInput placeholder="No tags" />
        </Field>
      </div>
    </div>
  );
}

import { Field, Input, Textarea } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Full name" hint="As it appears on your pilot licence.">
        <Input autoComplete="name" placeholder="Ada Lovelace" />
      </Field>
      <Field label="Email">
        <Input type="email" autoComplete="email" placeholder="ada@station.io" />
      </Field>
      <Field label="Crew size">
        <Input type="number" inputMode="numeric" min={1} max={12} defaultValue={4} />
      </Field>
      <Field label="Search the logs">
        <Input type="search" placeholder="Search…" />
      </Field>
      <Field label="Mission brief" hint="Markdown is supported." className="md:os-col-span-full">
        <Textarea rows={3} placeholder="What are we doing out here?" />
      </Field>
    </div>
  );
}

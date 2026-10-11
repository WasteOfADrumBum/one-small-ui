import { Field, Input, InputGroup, InputGroupText, Select, Textarea } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Handle">
        <InputGroup>
          <InputGroupText>@</InputGroupText>
          <Input autoComplete="username" />
        </InputGroup>
      </Field>
      <Field label="Website">
        <InputGroup>
          <InputGroupText>https://</InputGroupText>
          <Input placeholder="station.io" />
          <InputGroupText>.space</InputGroupText>
        </InputGroup>
      </Field>
      <Field label="Fuel budget">
        <InputGroup>
          <InputGroupText>CR</InputGroupText>
          <Input type="number" inputMode="decimal" />
          <InputGroupText>.00</InputGroupText>
        </InputGroup>
      </Field>
      <Field label="Priority">
        <InputGroup>
          <InputGroupText>Level</InputGroupText>
          <Select options={[{ value: '1', label: 'Routine' }, { value: '2', label: 'Urgent' }]} />
        </InputGroup>
      </Field>
      <Field label="Cargo manifest">
        <InputGroup>
          <Input type="file" />
          <InputGroupText>Max 5 MB</InputGroupText>
        </InputGroup>
      </Field>
      <Field label="Log entry">
        <InputGroup>
          <InputGroupText>Note</InputGroupText>
          <Textarea rows={2} />
        </InputGroup>
      </Field>
    </div>
  );
}

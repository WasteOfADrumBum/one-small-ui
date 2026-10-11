import { FloatingLabel, Input, Select, Textarea } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <FloatingLabel label="Email address">
        <Input type="email" autoComplete="email" placeholder="ada@station.io" />
      </FloatingLabel>
      <FloatingLabel label="Password">
        <Input type="password" autoComplete="current-password" />
      </FloatingLabel>
      <FloatingLabel label="Destination">
        <Select
          options={[
            { value: 'mars', label: 'Mars' },
            { value: 'titan', label: 'Titan' },
          ]}
        />
      </FloatingLabel>
      <FloatingLabel label="Arrival">
        <Input type="datetime-local" />
      </FloatingLabel>
      <FloatingLabel label="Launch time">
        <Input type="time" />
      </FloatingLabel>
      <FloatingLabel label="Comments" className="md:os-col-span-full">
        <Textarea rows={3} />
      </FloatingLabel>
    </div>
  );
}

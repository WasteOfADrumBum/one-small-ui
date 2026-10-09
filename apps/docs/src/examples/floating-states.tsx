import { FloatingLabel, Input } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <FloatingLabel label="Always floating" alwaysFloat>
        <Input placeholder="The placeholder stays visible" />
      </FloatingLabel>
      <FloatingLabel label="With hint and error" hint="Six or more characters." error="Too short.">
        <Input defaultValue="abc" />
      </FloatingLabel>
      <FloatingLabel label="Read-only" readOnly>
        <Input defaultValue="NOVA-7781" />
      </FloatingLabel>
      <FloatingLabel label="Disabled" disabled>
        <Input defaultValue="Locked" />
      </FloatingLabel>
    </div>
  );
}

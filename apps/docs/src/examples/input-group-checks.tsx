import { useId } from 'react';
import { Input, InputGroup, InputGroupText } from 'onesmallui';

export default function Example() {
  const id = useId();
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <InputGroup role="group" aria-label="Forward messages">
        <InputGroupText as="label">
          <input type="checkbox" aria-label="Forward messages to this address" defaultChecked />
        </InputGroupText>
        <Input type="email" aria-label="Forwarding address" defaultValue="relay@station.io" />
      </InputGroup>

      <InputGroup role="group" aria-labelledby={`${id}-label`}>
        <InputGroupText id={`${id}-label`}>Dock</InputGroupText>
        <InputGroupText as="label">
          <input type="radio" name={`${id}-dock`} defaultChecked /> A
        </InputGroupText>
        <InputGroupText as="label">
          <input type="radio" name={`${id}-dock`} /> B
        </InputGroupText>
        <Input aria-label="Bay number" placeholder="Bay" />
      </InputGroup>

      <InputGroup role="group" aria-label="Pilot name">
        <InputGroupText>First and last</InputGroupText>
        <Input aria-label="First name" autoComplete="given-name" />
        <Input aria-label="Last name" autoComplete="family-name" />
      </InputGroup>

      <InputGroup role="group" aria-label="Coordinates">
        <InputGroupText>X</InputGroupText>
        <Input aria-label="X coordinate" type="number" />
        <InputGroupText>Y</InputGroupText>
        <Input aria-label="Y coordinate" type="number" />
      </InputGroup>
    </div>
  );
}

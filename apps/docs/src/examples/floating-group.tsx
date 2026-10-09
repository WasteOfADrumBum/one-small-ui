import { Button, FloatingLabel, Input, InputGroup, InputGroupText } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <InputGroup>
        <InputGroupText>@</InputGroupText>
        <FloatingLabel label="Username">
          <Input autoComplete="username" />
        </FloatingLabel>
      </InputGroup>
      <InputGroup>
        <FloatingLabel label="Invite code">
          <Input />
        </FloatingLabel>
        <Button>Redeem</Button>
      </InputGroup>
    </div>
  );
}

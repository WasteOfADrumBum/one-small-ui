import { Button, Input, InputGroup, InputGroupText } from 'onesmallui';

const sizes = ['xs', 'sm', 'md', 'lg'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-4" style={{ maxWidth: '32rem' }}>
      {sizes.map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupText>{size}</InputGroupText>
          <Input aria-label={`Size ${size}`} placeholder={`Group size ${size}`} />
          <Button variant="outline">Go</Button>
        </InputGroup>
      ))}
    </div>
  );
}

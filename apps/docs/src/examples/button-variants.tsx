import { Button } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-items-center os-gap-3">
      <Button>Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="glow">Glow</Button>
      <Button variant="base" className="my-custom-btn">
        Base
      </Button>
    </div>
  );
}

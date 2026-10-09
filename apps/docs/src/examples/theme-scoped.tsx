import { Badge, Button, Card, CardBody } from 'onesmallui';

// data-os-theme works on any element, so one section (or one component) can
// use the other theme while the rest of the page follows the user's choice.
export default function Example() {
  return (
    <div className="os-grid os-grid-cols-1 md:os-grid-cols-2 os-gap-4">
      <Card data-os-theme="light">
        <CardBody className="os-flex os-items-center os-gap-3">
          <Badge color="success">Always light</Badge>
          <Button size="sm">Action</Button>
        </CardBody>
      </Card>
      <Card data-os-theme="dark">
        <CardBody className="os-flex os-items-center os-gap-3">
          <Badge color="accent">Always dark</Badge>
          <Button size="sm">Action</Button>
        </CardBody>
      </Card>
    </div>
  );
}

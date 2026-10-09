import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      {(['surface', 'glass', 'elevated'] as const).map((variant) => (
        <Card key={variant} variant={variant} as="article">
          <CardHeader>
            <h3>Orbital relay</h3>
            <Badge color="success" dot pulse>
              Online
            </Badge>
          </CardHeader>
          <CardBody>
            <p className="os-text-muted">
              Variant <code>{variant}</code>. Cards group related content and actions.
            </p>
          </CardBody>
          <CardFooter>
            <Button size="sm">Connect</Button>
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

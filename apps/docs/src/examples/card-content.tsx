import { Badge, Button, Card, CardBody, CardFooter, CardHeader, CardLink, CardSubtitle, CardText, CardTitle } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Card as="article">
        <CardBody>
          <CardTitle>Orbital relay 7</CardTitle>
          <CardSubtitle>Low orbit · 412 km</CardSubtitle>
          <CardText>Body, title, subtitle, text and link parts. Each is optional; use only what the content needs.</CardText>
          <CardLink href="#components/card">Telemetry</CardLink>
          <CardLink href="#components/list-group">Maintenance log</CardLink>
        </CardBody>
      </Card>

      <Card as="article" variant="outline">
        <CardHeader>
          <CardTitle as="h3">Supply run</CardTitle>
          <Badge color="warning">Delayed</Badge>
        </CardHeader>
        <CardBody>
          <CardText>Header and footer frame the body. Headers lay out a title with a badge or action.</CardText>
        </CardBody>
        <CardFooter className="os-text-sm os-text-muted">
          <span>Updated 3 minutes ago</span>
          <Button size="sm" variant="soft" style={{ marginInlineStart: 'auto' }}>
            Reschedule
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

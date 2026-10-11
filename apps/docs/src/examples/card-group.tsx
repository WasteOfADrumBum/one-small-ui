import { Card, CardBody, CardFooter, CardGroup, CardText, CardTitle } from 'onesmallui';

const plans = [
  { name: 'Orbit', text: 'Day trips to the station.' },
  { name: 'Lunar', text: 'Weekend stays at the lunar base, with a guided crater walk included.' },
  { name: 'Deep space', text: 'Long-haul missions.' },
];

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {/* Attached: edge to edge with equal heights from `sm` up. */}
      <CardGroup>
        {plans.map((p) => (
          <Card key={p.name} as="article">
            <CardBody>
              <CardTitle>{p.name}</CardTitle>
              <CardText>{p.text}</CardText>
            </CardBody>
            <CardFooter className="os-text-sm os-text-muted">Departs weekly</CardFooter>
          </Card>
        ))}
      </CardGroup>

      {/* Grid: as many columns as fit, each at least `minWidth`. */}
      <CardGroup layout="grid" minWidth="12rem">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} variant="elevated">
            <CardBody>
              <CardTitle as="h4">Bay {i + 1}</CardTitle>
              <CardText>Grid layout</CardText>
            </CardBody>
          </Card>
        ))}
      </CardGroup>

      {/* Width: cards fill their container; constrain them with a style or utility. */}
      <Card style={{ inlineSize: '18rem' }} variant="outline">
        <CardBody>
          <CardTitle as="h4">18rem wide</CardTitle>
          <CardText>Set width with inline styles, utilities or a grid.</CardText>
        </CardBody>
      </Card>
    </div>
  );
}

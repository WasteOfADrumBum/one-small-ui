import { Button, Card, CardBody, CardImage, CardText, CardTitle } from 'onesmallui';

export default function Example() {
  return (
    <Card as="article" orientation="horizontal" style={{ maxInlineSize: '40rem' }}>
      <CardImage src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=70" alt="Earth at night from orbit" />
      <CardBody>
        <CardTitle>Horizontal card</CardTitle>
        <CardText>
          From the <code>sm</code> breakpoint up the image sits beside the content. Set its share with the
          <code> --os-card-media-size</code> custom property.
        </CardText>
        <Button size="sm">Plan a visit</Button>
      </CardBody>
    </Card>
  );
}

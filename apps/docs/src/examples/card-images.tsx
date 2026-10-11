import { Card, CardBody, CardImage, CardOverlay, CardText, CardTitle } from 'onesmallui';

const earth = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&q=70';
const nebula = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&q=70';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <Card as="article">
        <CardImage src={earth} alt="Earth at night from orbit" ratio={16 / 9} />
        <CardBody>
          <CardTitle>Image on top</CardTitle>
          <CardText><code>position=&quot;top&quot;</code> (the default).</CardText>
        </CardBody>
      </Card>

      <Card as="article">
        <CardBody>
          <CardTitle>Image at the bottom</CardTitle>
          <CardText>Put the image last and set <code>position=&quot;bottom&quot;</code>.</CardText>
        </CardBody>
        <CardImage src={nebula} alt="A colorful nebula" position="bottom" ratio={16 / 9} />
      </Card>

      <Card as="article">
        <CardImage src={nebula} alt="" position="cover" />
        <CardOverlay>
          <CardTitle>Image overlay</CardTitle>
          <CardText>A dark scrim keeps text at 7:1 over any photo.</CardText>
        </CardOverlay>
      </Card>
    </div>
  );
}

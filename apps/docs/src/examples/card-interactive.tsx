import { Card, CardBody, CardMedia, Image } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 sm:os-grid-cols-2">
      <Card interactive glow variant="glass" as="article">
        <CardMedia>
          <Image
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&q=70"
            alt="Earth seen from orbit at night"
            ratio={16 / 9}
            rounded={false}
          />
        </CardMedia>
        <CardBody>
          <h3 className="os-text-lg">
            <a href="#components/card" className="os-stretched-link">
              Mission log 042
            </a>
          </h3>
          <p className="os-text-muted">Hover or focus to lift. The whole card is clickable through its heading link.</p>
        </CardBody>
      </Card>
      <Card interactive variant="outline" as="article">
        <CardBody>
          <p className="os-text-xs os-text-upper os-tracking-wider os-text-primary os-font-semibold">Telemetry</p>
          <p className="os-text-4xl os-font-display os-font-bold os-gradient-text">98.7%</p>
          <p className="os-text-muted">Uptime this cycle</p>
        </CardBody>
      </Card>
    </div>
  );
}

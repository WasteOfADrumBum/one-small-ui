import { Badge, Button, Card, CardBody, CardHeader, Grid, Progress, Switch } from 'onesmallui';
import { Code } from '../site/Code';

const features = [
  { title: 'WCAG 2.2 AAA', body: 'Every text and background pair is verified at 7:1. 44px targets, visible focus, reduced motion, full keyboard support.' },
  { title: 'Light & dark', body: 'Two hand-tuned themes driven by CSS variables. Follows the OS or the user, with no flash on load.' },
  { title: 'SCSS + variables', body: 'Override any token with @use … with (). Or skip Sass and use the compiled CSS.' },
  { title: 'Classes & data attributes', body: 'Components render plain classes like .os-btn[data-variant]. Use them in any HTML, with or without React.' },
  { title: 'Utilities', body: 'Tailwind-style responsive atoms (md:os-grid-cols-3) with Bootstrap-friendly names.' },
  { title: 'Drag & drop', body: 'Upload drop zones with validation and previews, and sortable lists that work by mouse, touch or keyboard.' },
];

function Orbit() {
  return (
    <svg className="docs-orbit" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="orbit-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--os-primary)" />
          <stop offset="1" stopColor="var(--os-accent)" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="70" className="docs-orbit__core" />
      <g className="docs-orbit__ring docs-orbit__ring--1">
        <circle cx="200" cy="200" r="110" />
        <circle cx="310" cy="200" r="6" className="docs-orbit__planet" />
      </g>
      <g className="docs-orbit__ring docs-orbit__ring--2">
        <circle cx="200" cy="200" r="150" strokeDasharray="4 10" />
        <circle cx="200" cy="50" r="9" className="docs-orbit__planet" />
      </g>
      <g className="docs-orbit__ring docs-orbit__ring--3">
        <circle cx="200" cy="200" r="190" strokeDasharray="1 6" />
        <circle cx="10" cy="200" r="4" className="docs-orbit__planet" />
      </g>
      <text x="200" y="212" textAnchor="middle" className="docs-orbit__label">
        1SmUI
      </text>
    </svg>
  );
}

export function Home() {
  return (
    <div className="docs-home">
      <section className="docs-hero" aria-labelledby="hero-title">
        <div className="docs-hero__copy">
          <Badge color="accent" dot pulse>
            v0.1 · React · TypeScript · SCSS
          </Badge>
          <h1 id="hero-title" className="docs-hero__title">
            <span className="os-gradient-text">OneSmallUI</span>
            <span className="docs-hero__sub">Interfaces for the next generation.</span>
          </h1>
          <p className="docs-hero__lead">
            A component library that looks like it shipped on a starship, and passes WCAG AAA while doing it. Light and
            dark themes, SCSS tokens, utility classes, smooth motion, and drag and drop built in.
          </p>
          <div className="os-flex os-flex-wrap os-gap-3">
            <Button size="lg" href="#getting-started">
              Get started
            </Button>
            <Button size="lg" variant="outline" color="accent" href="#components/button">
              Browse components
            </Button>
          </div>
        </div>
        <Orbit />
      </section>

      <Code language="bash" title="Install" code="npm install onesmallui" />

      <section aria-labelledby="features-title" className="os-mt-12">
        <h2 id="features-title" className="docs-h2">
          Built in
        </h2>
        <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {features.map((f) => (
            <Card key={f.title} variant="glass" as="article" interactive>
              <CardBody>
                <h3 className="os-text-lg">{f.title}</h3>
                <p className="os-text-muted">{f.body}</p>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </section>

      <section aria-labelledby="demo-title" className="os-mt-12">
        <h2 id="demo-title" className="docs-h2">
          Mission control
        </h2>
        <p className="os-text-muted">A few components working together.</p>
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <Card variant="glass" glow as="article">
            <CardHeader>
              <h3>Reactor status</h3>
              <Badge color="success" dot pulse>
                Stable
              </Badge>
            </CardHeader>
            <CardBody className="os-grid os-gap-4">
              <Progress label="Core output" value={72} showValue />
              <Progress label="Shield integrity" value={91} color="success" showValue />
              <Progress label="Coolant" value={38} color="warning" showValue />
            </CardBody>
          </Card>
          <Card variant="glass" as="article">
            <CardHeader>
              <h3>Flight systems</h3>
            </CardHeader>
            <CardBody>
              <Switch label="Autopilot" defaultChecked />
              <Switch label="Inertial dampers" defaultChecked description="Keeps the crew upright" />
              <Switch label="Cloaking field" />
            </CardBody>
          </Card>
        </Grid>
      </section>
    </div>
  );
}

import { Carousel, CarouselCaption, CarouselSlide } from 'onesmallui';

// Images as SVG data URIs so the example is self-contained.
const art = (hue: number, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 30%)"/><stop offset="1" stop-color="hsl(${hue + 60} 70% 15%)"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)"/><circle cx="600" cy="120" r="70" fill="hsl(${hue} 80% 70%)"/><text x="40" y="80" font-size="40" fill="white" font-family="sans-serif">${label}</text></svg>`,
  )}`;

const planets = [
  { name: 'Kepler-22b', hue: 200 },
  { name: 'Proxima b', hue: 280 },
  { name: 'TRAPPIST-1e', hue: 20 },
  { name: 'Gliese 667 Cc', hue: 140 },
];

export default function Example() {
  return (
    <Carousel aria-label="Exoplanets" style={{ maxWidth: '40rem' }}>
      {planets.map((p) => (
        <CarouselSlide key={p.name}>
          <img src={art(p.hue, p.name)} alt={`Illustration of ${p.name}`} width={800} height={400} />
          <CarouselCaption>
            <strong>{p.name}</strong>
            <p className="os-text-sm os-mb-0">Swipe, scroll, or use the buttons and arrow keys.</p>
          </CarouselCaption>
        </CarouselSlide>
      ))}
    </Carousel>
  );
}

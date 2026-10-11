import { Card, Carousel, CarouselSlide } from 'onesmallui';

const crew = ['Vega', 'Ortiz', 'Ana', 'Kaito', 'Noor', 'Sami', 'Lena'];

const Slide = ({ name }: { name: string }) => (
  <Card className="os-h-full">
    <strong>{name}</strong>
    <p className="os-text-sm os-text-muted os-mb-0">Crew member</p>
  </Card>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-8" style={{ maxWidth: '44rem' }}>
      {/* Several slides at once, with neighbors peeking in; controls in a bar underneath; stops at the end. */}
      <Carousel aria-label="Crew (multiple, peek)" itemsPerView={3} peek="8%" controls="bottom" end="stop">
        {crew.map((n) => (
          <CarouselSlide key={n}>
            <Slide name={n} />
          </CarouselSlide>
        ))}
      </Carousel>

      {/* Variable widths: each slide sets its own width. Controls on top; loops around. */}
      <Carousel aria-label="Crew (variable widths)" itemsPerView="auto" controls="top" end="loop" indicators={false}>
        {crew.map((n, i) => (
          <CarouselSlide key={n} style={{ width: `${8 + (i % 3) * 4}rem` }}>
            <Slide name={n} />
          </CarouselSlide>
        ))}
      </Carousel>

      {/* Crossfade, opt-in autoplay with per-slide intervals, dark appearance. */}
      <Carousel aria-label="Status (fade, autoplay)" transition="fade" autoplay={4000} appearance="dark" controls="bottom">
        <CarouselSlide interval={2000}>
          <Card>All systems nominal.</Card>
        </CarouselSlide>
        <CarouselSlide>
          <Card>Next jump in 3 hours.</Card>
        </CarouselSlide>
        <CarouselSlide interval={6000}>
          <Card>Weather on arrival: dust storms.</Card>
        </CarouselSlide>
      </Carousel>
    </div>
  );
}

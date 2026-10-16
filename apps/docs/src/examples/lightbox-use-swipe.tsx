import { useRef, useState } from 'react';
import { Button, Card, CardBody, useSwipe, type SwipeDirection } from '@onesmall/ui';

const tips = ['Shoot in the hour after sunrise.', 'Put the horizon on a third.', 'Bracket bright skies.', 'Wipe the lens. Again.'];

export default function Example() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [last, setLast] = useState<SwipeDirection | null>(null);
  const next = () => setI((n) => Math.min(n + 1, tips.length - 1));
  const prev = () => setI((n) => Math.max(n - 1, 0));
  // 'start' is toward the reading start in LTR and RTL alike, so there is nothing to flip.
  useSwipe(ref, {
    mouse: true,
    onSwipe: (direction) => {
      setLast(direction);
      if (direction === 'start') next();
      else prev();
    },
  });

  return (
    <div className="os-grid os-gap-3" style={{ maxInlineSize: '24rem' }}>
      <Card ref={ref} style={{ touchAction: 'pan-y', userSelect: 'none' }}>
        <CardBody>
          <p className="os-mb-0">
            Tip {i + 1} of {tips.length}: {tips[i]}
          </p>
        </CardBody>
      </Card>
      <div className="os-flex os-items-center os-gap-2">
        <Button size="sm" variant="outline" onClick={prev}>
          Previous tip
        </Button>
        <Button size="sm" variant="outline" onClick={next}>
          Next tip
        </Button>
        <span className="os-text-muted os-text-sm">Last swipe: {last ?? 'none'}</span>
      </div>
    </div>
  );
}

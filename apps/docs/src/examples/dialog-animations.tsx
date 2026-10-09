import { useState } from 'react';
import { Button, Dialog, type DialogAnimation } from 'onesmallui';

const animations: DialogAnimation[] = ['scale', 'fade', 'slide-down', 'slide-up', 'none'];

export default function Example() {
  const [animation, setAnimation] = useState<DialogAnimation | null>(null);
  const [dark, setDark] = useState(false);
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      {animations.map((a) => (
        <Button key={a} variant="outline" onClick={() => setAnimation(a)}>
          {a === 'none' ? 'Instant' : a}
        </Button>
      ))}
      <Button
        variant="soft"
        color="inverse"
        onClick={() => {
          setDark(true);
          setAnimation('scale');
        }}
      >
        Dark appearance
      </Button>
      <Dialog
        open={animation !== null}
        onClose={() => {
          setAnimation(null);
          setDark(false);
        }}
        animation={animation ?? 'scale'}
        appearance={dark ? 'dark' : 'default'}
        size="sm"
        title={dark ? 'Dark dialog' : `Animation: ${animation}`}
      >
        <p>Motion turns off automatically for people who prefer reduced motion.</p>
      </Dialog>
    </div>
  );
}

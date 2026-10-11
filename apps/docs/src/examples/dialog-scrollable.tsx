import { useState } from 'react';
import { Button, Dialog } from 'onesmallui';

const paragraphs = Array.from({ length: 14 }, (_, i) => (
  <p key={i}>
    Article {i + 1}. Crew members keep their stations clean, log every jump, and report anomalies to the
    captain before the next shift begins.
  </p>
));

export default function Example() {
  const [mode, setMode] = useState<'body' | 'page' | null>(null);
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Button variant="outline" onClick={() => setMode('body')}>
        Scrollable body
      </Button>
      <Button variant="outline" onClick={() => setMode('page')}>
        Whole dialog scrolls
      </Button>
      <Dialog
        open={mode !== null}
        onClose={() => setMode(null)}
        scrollable={mode !== 'page'}
        title="Crew charter"
        footer={<Button onClick={() => setMode(null)}>I agree</Button>}
      >
        {paragraphs}
      </Dialog>
    </div>
  );
}

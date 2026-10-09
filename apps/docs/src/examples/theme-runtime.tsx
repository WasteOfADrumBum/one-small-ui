import { useState, type CSSProperties } from 'react';
import { Button, Progress, Switch } from 'onesmallui';

// Every token is a CSS variable, so you can re-skin any subtree at runtime.
// Here the primary role borrows the accent tokens (still AAA in both themes).
const accentAsPrimary = {
  '--os-primary': 'var(--os-accent)',
  '--os-primary-hover': 'var(--os-accent-hover)',
  '--os-on-primary': 'var(--os-on-accent)',
  '--os-primary-soft': 'var(--os-accent-soft)',
  '--os-primary-text': 'var(--os-accent-text)',
} as CSSProperties;

export default function Example() {
  const [on, setOn] = useState(true);
  return (
    <div className="os-grid os-gap-4" style={on ? accentAsPrimary : undefined}>
      <Switch label="Use accent as primary" checked={on} onChange={(e) => setOn(e.target.checked)} />
      <div className="os-flex os-flex-wrap os-gap-3">
        <Button>Primary</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <Progress label="Upload" value={64} showValue />
    </div>
  );
}

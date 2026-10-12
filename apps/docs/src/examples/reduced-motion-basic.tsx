import { useRef } from 'react';
import { Badge, Button, useReducedMotion } from '@onesmall/ui';

// CSS motion is handled for you. Use the hook for motion started from JavaScript.
export default function Example() {
  const reduced = useReducedMotion();
  const summary = useRef<HTMLParagraphElement>(null);
  return (
    <div className="os-grid os-gap-3">
      <div className="os-flex os-flex-wrap os-items-center os-gap-3">
        <Badge color={reduced ? 'warning' : 'neutral'}>Reduced motion: {reduced ? 'on' : 'off'}</Badge>
        <Button size="sm" variant="soft" onClick={() => summary.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })}>
          Jump to summary
        </Button>
      </div>
      <p ref={summary} className="os-mb-0">
        Summary: three burns, all nominal. Smooth scrolling only when motion is welcome.
      </p>
    </div>
  );
}

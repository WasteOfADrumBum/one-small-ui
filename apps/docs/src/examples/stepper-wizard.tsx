import { useState } from 'react';
import { Button, Step, Stepper } from 'onesmallui';

const steps = [
  { title: 'Crew', body: 'Pick who flies: up to six crew members.' },
  { title: 'Destination', body: 'Choose an orbit, the Moon or a deep-space waypoint.' },
  { title: 'Cargo', body: 'Load supplies; the hold takes 12 tonnes.' },
  { title: 'Confirm', body: 'Review the plan and file it with mission control.' },
];

export default function Example() {
  const [active, setActive] = useState(0);
  // Linked steps: earlier steps are buttons you can go back to; later ones are disabled.
  return (
    <div className="os-grid os-gap-4">
      <Stepper activeStep={active} orientation={{ base: 'vertical', md: 'horizontal' }} aria-label="Flight plan wizard">
        {steps.map((s, i) => (
          <Step key={s.title} title={s.title} onClick={() => setActive(i)} disabled={i > active} />
        ))}
      </Stepper>
      <div className="os-p-4 os-rounded-lg os-bg-surface-2" role="region" aria-label={`Step ${active + 1}: ${steps[active]!.title}`}>
        {steps[active]!.body}
      </div>
      <div className="os-flex os-gap-2">
        <Button variant="soft" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>
          Back
        </Button>
        <Button onClick={() => setActive((a) => Math.min(steps.length - 1, a + 1))} disabled={active === steps.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}

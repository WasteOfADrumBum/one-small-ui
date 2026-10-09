import { Step, Stepper } from 'onesmallui';

const legs = ['Earth', 'LEO', 'Gateway', 'Lunar orbit', 'Surface', 'Ascent', 'Gateway', 'Return burn', 'Re-entry', 'Splashdown'];

export default function Example() {
  // Too many steps for the width: the stepper scrolls sideways and becomes a focusable region,
  // so keyboard users can scroll it too. --os-stepper-step-min sets each step's minimum width.
  return (
    <Stepper activeStep={4} aria-label="Lunar mission legs">
      {legs.map((leg, i) => (
        <Step key={`${leg}-${i}`} title={leg} href={`#components/stepper`} />
      ))}
    </Stepper>
  );
}

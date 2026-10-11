import { Step, Stepper } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8">
      <Stepper activeStep={2} aria-label="Checkout progress">
        <Step title="Cart" description="3 items" />
        <Step title="Shipping" description="Lunar base" />
        <Step title="Payment" description="Credits" />
        <Step title="Review" />
      </Stepper>

      <Stepper activeStep={1} variant="outline" color="accent" aria-label="Onboarding progress">
        <Step title="Account" />
        <Step title="Profile" />
        <Step title="Verify" status="error" description="Code expired" />
        <Step title="Done" />
      </Stepper>

      <Stepper activeStep={2} variant="dot" color="success" align="start" gap="0.75rem" aria-label="Launch sequence">
        <Step title="Fuel" />
        <Step title="Systems" />
        <Step title="Ignition" />
        <Step title="Liftoff" />
      </Stepper>
    </div>
  );
}

import { Badge, Button, Step, Stepper } from 'onesmallui';

export default function Example() {
  return (
    <Stepper orientation="vertical" variant="dot" activeStep={2} gap="1.5rem" aria-label="Mission timeline">
      <Step title="Launch" description="06:40 · Pad 39A">
        Clean ascent; main engine cut-off at T+8:32.
      </Step>
      <Step title="Orbit insertion" description="07:12">
        <Badge color="success">Nominal</Badge>
      </Step>
      <Step title="Docking" description="In progress">
        <p>Approaching port 3 at 0.1 m/s.</p>
        <Button size="sm" variant="soft">
          Open camera feed
        </Button>
      </Step>
      <Step title="Crew transfer" description="Scheduled 11:00" />
    </Stepper>
  );
}

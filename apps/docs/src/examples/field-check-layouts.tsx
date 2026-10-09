import { Checkbox, FieldGroup, Radio, RadioGroup, Switch } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8">
      <div className="os-grid os-gap-6 md:os-grid-cols-2">
        <FieldGroup legend="Notify me about (stacked)">
          <Checkbox label="Launches" defaultChecked />
          <Checkbox label="Docking requests" />
          <Checkbox label="Solar storms" />
        </FieldGroup>
        <FieldGroup legend="Systems (inline)" layout="inline">
          <Switch label="Shields" defaultChecked />
          <Switch label="Cloak" />
          <Switch label="Comms" defaultChecked />
        </FieldGroup>
      </div>

      <RadioGroup label="Plan (cards)" variant="card" defaultValue="crew">
        <Radio value="solo" label="Solo" description="One pilot, one ship." />
        <Radio value="crew" label="Crew" description="Up to 12 seats and shared logs." />
        <Radio value="fleet" label="Fleet" description="Unlimited ships with admin roles." />
      </RadioGroup>

      <FieldGroup legend="Add-ons (cards)" layout="grid" minItemWidth="13rem">
        <Checkbox variant="card" label="Insurance" description="Covers hull damage." defaultChecked />
        <Checkbox variant="card" label="Extra cargo" description="Doubles the hold." />
        <Switch variant="card" label="Autopilot" description="Hands-free cruising." />
      </FieldGroup>
    </div>
  );
}

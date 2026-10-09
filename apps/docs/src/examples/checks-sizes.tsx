import { Checkbox, Radio, RadioGroup, Switch } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3">
      <div>
        <Checkbox size="sm" label="Small" defaultChecked />
        <Checkbox label="Medium" defaultChecked />
        <Checkbox size="lg" label="Large" defaultChecked />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled, checked" disabled defaultChecked />
      </div>
      <RadioGroup label="Radio sizes" defaultValue="md">
        <Radio size="sm" value="sm" label="Small" />
        <Radio value="md" label="Medium" />
        <Radio size="lg" value="lg" label="Large" />
        <Radio value="off" label="Disabled" disabled />
      </RadioGroup>
      <div>
        <Switch size="sm" label="Small" defaultChecked />
        <Switch label="Medium" defaultChecked />
        <Switch size="lg" label="Large" defaultChecked />
        <Switch label="Wide (custom width)" width="4.5rem" defaultChecked />
        <Switch label="Disabled" disabled defaultChecked />
      </div>
    </div>
  );
}

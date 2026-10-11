import { ToggleButton, ToggleButtonGroup } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <div className="os-flex os-flex-wrap os-gap-3">
        <ToggleButton name="notify">Notifications</ToggleButton>
        <ToggleButton name="beta" defaultChecked color="accent" checkedVariant="soft">
          Beta features
        </ToggleButton>
      </div>
      <ToggleButtonGroup aria-label="Text alignment" type="single" defaultValue={['left']} color="secondary">
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup aria-label="Text style" type="multiple" defaultValue={['bold']} attached={false} shape="pill">
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

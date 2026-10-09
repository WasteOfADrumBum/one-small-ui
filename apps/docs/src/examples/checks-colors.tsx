import { Checkbox, Radio, RadioGroup, Switch, type ThemeColor } from 'onesmallui';

const colors: ThemeColor[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3">
      <div>
        {colors.map((c) => (
          <Checkbox key={c} color={c} label={c} defaultChecked />
        ))}
      </div>
      <RadioGroup label="Radio colors (pick one to see it)" defaultValue="accent">
        {colors.map((c) => (
          <Radio key={c} value={c} color={c} label={c} />
        ))}
      </RadioGroup>
      <div>
        {colors.map((c) => (
          <Switch key={c} color={c} label={c} defaultChecked />
        ))}
      </div>
    </div>
  );
}

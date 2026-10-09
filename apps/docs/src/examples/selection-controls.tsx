import { useState } from 'react';
import { Checkbox, Radio, RadioGroup, Switch } from 'onesmallui';

const systems = ['Shields', 'Thrusters', 'Life support'];

export default function Example() {
  const [checked, setChecked] = useState<string[]>(['Shields']);
  const all = checked.length === systems.length;
  const some = checked.length > 0 && !all;

  return (
    <div className="os-grid os-gap-8 md:os-grid-cols-3">
      <div>
        <Checkbox
          label="All systems"
          checked={all}
          indeterminate={some}
          onChange={() => setChecked(all ? [] : systems)}
        />
        <div className="os-pl-6">
          {systems.map((s) => (
            <Checkbox
              key={s}
              label={s}
              checked={checked.includes(s)}
              onChange={(e) => setChecked(e.target.checked ? [...checked, s] : checked.filter((x) => x !== s))}
            />
          ))}
        </div>
      </div>

      <RadioGroup label="Warp speed" defaultValue="cruise">
        <Radio value="idle" label="Idle" />
        <Radio value="cruise" label="Cruise" description="Balanced fuel use" />
        <Radio value="max" label="Maximum" description="Not recommended near stars" />
      </RadioGroup>

      <div>
        <Switch label="Autopilot" defaultChecked />
        <Switch label="Stealth mode" description="Hides your ship from scanners" />
        <Switch label="Disabled" disabled />
      </div>
    </div>
  );
}

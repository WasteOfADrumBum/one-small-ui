import { useState } from 'react';
import { Field, TimePicker } from '@onesmall/ui';

export default function Example() {
  const [time, setTime] = useState<string | null>('09:30');
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Start time" hint={`Type 9, 930 or 9:30p, or pick from the list. Value: ${time ?? 'none'}`}>
        <TimePicker name="start" value={time} onValueChange={setTime} />
      </Field>
      <Field label="Departure (24-hour)">
        <TimePicker hourCycle="h23" step={30} defaultValue="21:30" appearance="dark" />
      </Field>
    </div>
  );
}

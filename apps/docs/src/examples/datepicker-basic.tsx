import { useState } from 'react';
import { DatePicker, Field } from 'onesmallui';

export default function Example() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 9));
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Launch date" hint="Type yyyy-mm-dd or use the calendar.">
        <DatePicker name="launch" value={date} onValueChange={setDate} />
      </Field>
      <Field label="Return date">
        <DatePicker trigger="button" appearance="dark" placement="top-start" placeholder="Pick a date" />
      </Field>
      <Field label="Trip (range, two months)">
        <DatePicker mode="range" months={2} min={new Date(2026, 9, 1)} firstDayOfWeek={1} />
      </Field>
      <Field label="Day off (German format)">
        <DatePicker locale="de-DE" format={{ weekday: 'short', day: 'numeric', month: 'long' }} />
      </Field>
    </div>
  );
}

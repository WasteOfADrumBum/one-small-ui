import { useState } from 'react';
import { DatePicker, Field, FieldGroup, TimePicker, formatTime, toISODate } from '@onesmall/ui';

export default function Example() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 9));
  const [time, setTime] = useState<string | null>('14:00');
  const day = date ? toISODate(date) : null;
  return (
    <FieldGroup legend="Launch window" layout="inline">
      <Field label="Date">
        <DatePicker name="launch-date" value={date} onValueChange={setDate} />
      </Field>
      <Field label="Time">
        <TimePicker name="launch-time" value={time} onValueChange={setTime} />
      </Field>
      <p>{day && time ? `Launching ${day}T${time} (${formatTime(time)})` : 'Pick a date and a time.'}</p>
    </FieldGroup>
  );
}

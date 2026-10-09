import { useState } from 'react';
import { Calendar } from 'onesmallui';

export default function Example() {
  const [days, setDays] = useState<Date[]>([new Date(2026, 9, 12), new Date(2026, 9, 14)]);
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  return (
    <div className="os-grid os-gap-2">
      <Calendar
        aria-label="Shift days"
        mode="multiple"
        value={days}
        onValueChange={setDays}
        defaultMonth={new Date(2026, 9, 1)}
        isDateDisabled={weekend}
        color="success"
      />
      <p className="os-text-sm">{days.length} days selected. Weekends are unavailable.</p>
    </div>
  );
}

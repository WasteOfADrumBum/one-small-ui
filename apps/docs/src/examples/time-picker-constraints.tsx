import { Field, TimePicker } from '@onesmall/ui';

// Lunch is blocked; the list runs 9:00 to 17:00 in 30 minute steps.
const isLunch = (time: string) => time >= '12:00' && time < '13:00';

export default function Example() {
  return (
    <Field label="Appointment" hint="Weekdays 9 AM to 5 PM, closed for lunch." required>
      <TimePicker name="appointment" min="09:00" max="17:00" step={30} isTimeDisabled={isLunch} />
    </Field>
  );
}

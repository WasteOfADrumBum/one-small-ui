import { Field, Range } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8 md:os-grid-cols-2">
      <Field label="Warp factor" hint="Steps of 1, with a tick on every step.">
        <Range min={1} max={9} step={1} defaultValue={5} ticks showValue />
      </Field>
      <Field label="Shield mode">
        <Range
          min={0}
          max={100}
          step={25}
          defaultValue={50}
          ticks={[
            { value: 0, label: 'Off' },
            { value: 25, label: 'Low' },
            { value: 50, label: 'Mid' },
            { value: 75, label: 'High' },
            { value: 100, label: 'Max' },
          ]}
          formatValue={(v) => ['Off', 'Low', 'Mid', 'High', 'Max'][v / 25]!}
        />
      </Field>
    </div>
  );
}

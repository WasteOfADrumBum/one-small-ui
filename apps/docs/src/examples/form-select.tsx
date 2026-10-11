import { Field, Select } from 'onesmallui';

const ships = [
  { value: 'nova', label: 'Nova', group: 'Scouts' },
  { value: 'wisp', label: 'Wisp', group: 'Scouts' },
  { value: 'atlas', label: 'Atlas', group: 'Freighters' },
  { value: 'hauler', label: 'Hauler', group: 'Freighters' },
  { value: 'ark', label: 'Ark (retired)', group: 'Freighters', disabled: true },
];

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <Field label="Ship">
        <Select placeholder="Choose a ship" options={ships} />
      </Field>
      <Field label="Escort ships" hint="Hold Ctrl or ⌘ to pick several.">
        <Select multiple options={ships} defaultValue={['nova', 'atlas']} />
      </Field>
      <Field label="Hangar">
        <Select htmlSize={4} defaultValue="b">
          <option value="a">Hangar A</option>
          <option value="b">Hangar B</option>
          <option value="c">Hangar C</option>
          <option value="d">Hangar D</option>
          <option value="e">Hangar E</option>
        </Select>
      </Field>
    </div>
  );
}

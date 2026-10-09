import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const look = [
  { name: 'color', type: status, default: "'primary'", description: 'Fill color when checked.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control and text size. The hit area stays 44px.' },
  { name: 'variant', type: "'default' | 'card'", default: "'default'", description: 'Card: a bordered tile that highlights when checked; the whole tile is clickable.' },
  { name: 'invalid', type: 'boolean', description: 'Error style and aria-invalid.' },
];

const doc: ComponentDoc = {
  slug: 'selection',
  order: 52,
  name: 'Checkbox, Radio, Switch',
  group: 'Forms',
  summary:
    'Native selection controls with an animated custom look: checked, unchecked and indeterminate states, descriptions, eight theme colors, three sizes, cards and disabled states.',
  importLine: "import { Checkbox, RadioGroup, Radio, Switch } from 'onesmallui';",
  examples: [
    { name: 'selection-controls', title: 'Selection controls', description: 'Checkbox with indeterminate parent, a radio group and switches.' },
    { name: 'checks-colors', title: 'Theme colors', description: 'Every ThemeColor. Checked boxes keep a 3:1 border even for light fills like warning.' },
    { name: 'checks-sizes', title: 'Sizes, custom width and disabled', description: 'Switch width is a CSS variable (--os-switch-width), set with the width prop.' },
  ],
  props: [
    {
      title: 'Checkbox',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required label.' },
        { name: 'description', type: 'ReactNode', description: 'Secondary text, linked with aria-describedby.' },
        { name: 'indeterminate', type: 'boolean', description: 'Partially checked state (announced as "mixed").' },
        ...look,
      ],
    },
    {
      title: 'RadioGroup',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Rendered as the fieldset legend.' },
        { name: 'value / defaultValue', type: 'string', description: 'Selected value (controlled or not).' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Selection callback.' },
        { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout from sm up.' },
        { name: 'hint / error', type: 'ReactNode', description: 'Help text and a group error, linked to the fieldset.' },
        { name: 'required / disabled', type: 'boolean', description: 'Applies to every radio.' },
        { name: 'color / size / variant', type: '…', description: 'Defaults for every Radio inside.' },
      ],
    },
    {
      title: 'Radio',
      props: [
        { name: 'value', type: 'string', description: 'Required.' },
        { name: 'label / description', type: 'ReactNode', description: 'Label and secondary text.' },
        ...look,
      ],
    },
    {
      title: 'Switch',
      props: [
        { name: 'label / description', type: 'ReactNode', description: 'Label and secondary text.' },
        { name: 'labelPosition', type: "'start' | 'end'", default: "'end'", description: 'Label side.' },
        { name: 'width', type: 'string', description: 'Custom track width (sets --os-switch-width).' },
        ...look,
      ],
    },
  ],
  a11y: [
    'Real <input> elements keep native keyboard behavior: Space toggles, arrow keys move between radios.',
    'Switch uses role="switch" so it is announced as on/off. Its thumb is positioned with logical insets, so it slides the right way in right-to-left layouts.',
    'Each control has a 44px hit area; card variants make the whole card clickable.',
    'Checked state is shown by a tick, dot or thumb position, not by color alone, and every theme color keeps a 3:1 boundary.',
  ],
  classes: `.os-check[data-color][data-size][data-variant="card"][data-invalid][data-disabled] > .os-check__input + .os-check__box + .os-check__text
.os-radio-group[data-orientation][data-variant] > .os-radio-group__options > .os-check.os-radio
.os-switch[data-color][data-size][data-label-position] > .os-switch__input + .os-switch__track > .os-switch__thumb
--os-switch-width`,
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'selection',
  order: 60,
  name: 'Checkbox, Radio, Switch',
  group: 'Forms',
  summary: 'Native selection controls with an animated custom look, descriptions and indeterminate state.',
  importLine: "import { Checkbox, RadioGroup, Radio, Switch } from 'onesmallui';",
  examples: [{ name: 'selection-controls', title: 'Selection controls' }],
  props: [
    {
      title: 'Checkbox',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required label.' },
        { name: 'description', type: 'ReactNode', description: 'Secondary text.' },
        { name: 'indeterminate', type: 'boolean', description: 'Partially checked state.' },
      ],
    },
    {
      title: 'RadioGroup',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Rendered as the fieldset legend.' },
        { name: 'value / defaultValue', type: 'string', description: 'Selected value (controlled or not).' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Selection callback.' },
        { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout from sm up.' },
      ],
    },
    {
      title: 'Switch',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required label.' },
        { name: 'labelPosition', type: "'start' | 'end'", default: "'end'", description: 'Label side.' },
      ],
    },
  ],
  a11y: [
    'Real <input> elements keep native keyboard behavior: Space toggles, arrow keys move between radios.',
    'Switch uses role="switch" so it is announced as on/off.',
    'Each control has a 44px hit area.',
  ],
  classes: '.os-check, .os-radio-group, .os-switch',
};

export default doc;

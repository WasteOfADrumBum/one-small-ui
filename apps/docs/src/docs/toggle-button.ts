import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'toggle-button',
  order: 30,
  name: 'Toggle button',
  group: 'Actions',
  summary: 'Checkboxes and radios that look like buttons. Real inputs underneath, so they submit with forms.',
  importLine: "import { ToggleButton, ToggleButtonGroup } from 'onesmallui';",
  examples: [{ name: 'toggle-buttons', title: 'Checkbox and radio toggles' }],
  props: [
    {
      title: 'ToggleButton',
      props: [
        { name: 'type', type: "'checkbox' | 'radio'", default: "'checkbox'", description: 'Set by the group when inside one.' },
        { name: 'checked / defaultChecked / onChange', type: 'input props', description: 'Standalone state.' },
        { name: 'value', type: 'string', description: 'Required inside a ToggleButtonGroup.' },
        { name: 'variant / color / size / shape', type: 'Button props', default: "'outline'", description: 'Unchecked look.' },
        { name: 'color', type: color, description: 'Color role.' },
        { name: 'checkedVariant', type: "'solid' | 'soft' | 'outline'", default: "'solid'", description: 'Checked look.' },
      ],
    },
    {
      title: 'ToggleButtonGroup',
      props: [
        { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'Radios or checkboxes.' },
        { name: 'value / defaultValue', type: 'string[]', description: 'Selected values.' },
        { name: 'onValueChange', type: '(value: string[]) => void', description: 'Selection callback.' },
        { name: 'name', type: 'string', description: 'Form field name.' },
        { name: '...ButtonGroup props', type: '', description: 'orientation, attached, dividers, size, variant, color.' },
      ],
    },
  ],
  a11y: [
    'Native checkbox and radio inputs: Space toggles, arrow keys move within a radio group.',
    'Checked buttons show a check mark as well as a fill, so state never relies on color alone (1.4.1).',
  ],
  classes: '.os-toggle-btn[data-checked-variant] > input.os-toggle-btn__input + label.os-btn',
};

export default doc;

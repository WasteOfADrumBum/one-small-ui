import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'form-validation',
  order: 62,
  name: 'Form layout & validation',
  group: 'Forms',
  summary:
    'Form lays fields out vertically, horizontally, inline or in a grid, and adds validation: native constraint validation with styled messages, states shown only after interaction or a submit attempt, server errors, success states, tooltip feedback and custom state colors.',
  importLine: "import { Form, Field } from 'onesmallui';",
  examples: [
    { name: 'form-layouts', title: 'Vertical, horizontal, inline and grid layouts' },
    {
      name: 'form-validation',
      title: 'Browser-native validation',
      description: 'Uses required, type, pattern and min/max. Submit empty: messages come from the browser, styled and announced by each Field, and focus moves to the first invalid control.',
    },
    {
      name: 'form-server-errors',
      title: 'Server-side errors, valid states and custom colors',
      description: 'Errors from the server go in Field error; success in success. --os-valid-color and --os-invalid-color restyle the states.',
    },
  ],
  props: [
    {
      title: 'Form',
      props: [
        { name: 'layout', type: "'vertical' | 'horizontal' | 'inline' | 'grid'", default: "'vertical'", description: 'Arrangement of fields.' },
        { name: 'columns', type: 'number', default: '2', description: 'Grid columns from md up (--os-form-cols).' },
        { name: 'labelWidth', type: 'string', description: 'Label column for horizontal layout (--os-field-label-width).' },
        { name: 'validation', type: "'custom' | 'native' | 'none'", default: "'custom'", description: 'custom: styled messages in Fields and blocked submit; native: browser bubbles; none: no checks.' },
        { name: 'validated', type: 'boolean', description: 'Force the validated state (data-validated).' },
        { name: 'onInvalidSubmit', type: '(event) => void', description: 'Called instead of onSubmit when invalid.' },
      ],
    },
  ],
  reference: [
    {
      title: 'Validation states',
      columns: ['Selector', 'When it applies'],
      rows: [
        ['[data-invalid] / [data-valid]', 'Props: Field error / success / valid, or invalid / valid on the control (server-side states).'],
        [':user-invalid', 'Native: after the user has edited and left an invalid control.'],
        ['.os-field[data-touched]', 'Set by Field once focus leaves it (fallback for :user-invalid).'],
        ['.os-form[data-validated]', 'After a submit attempt: every invalid control is marked, and required valid ones show success.'],
        ['--os-invalid-color / --os-valid-color', 'Custom state colors, settable on any ancestor.'],
      ],
    },
  ],
  a11y: [
    'Invalid controls get aria-invalid and their message is linked with aria-describedby and announced politely.',
    'Errors are only shown after interaction or a submit attempt, so users are not warned before they start (3.3.1, 3.3.3).',
    'On a blocked submit, focus moves to the first invalid control.',
    'Messages pair an icon with text; state is never shown by color alone.',
    'Inline and horizontal layouts stack on small screens.',
  ],
  classes: `.os-form[data-layout="vertical|horizontal|inline|grid"][data-validated]
--os-form-cols, --os-field-label-width, --os-invalid-color, --os-valid-color`,
};

export default doc;

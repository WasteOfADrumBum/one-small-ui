import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'floating-labels',
  order: 55,
  name: 'Floating labels',
  group: 'Forms',
  summary:
    'Labels that sit inside the control and float up when it has focus or a value. Works with inputs, textareas, selects, date and time controls, inside input groups, and with hints and errors.',
  importLine: "import { FloatingLabel } from 'onesmallui'; // or <Field layout=\"floating\">",
  examples: [
    { name: 'floating-basic', title: 'Inputs, textareas, selects and date/time', description: 'Selects and date/time controls always show a value, so their label stays up.' },
    { name: 'floating-group', title: 'Inside input groups' },
    { name: 'floating-states', title: 'Always floating, feedback, read-only and disabled' },
  ],
  props: [
    {
      title: 'FloatingLabel',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required. Floats when the control is focused or filled.' },
        { name: 'alwaysFloat', type: 'boolean', description: 'Keep the label raised, e.g. to show a placeholder.' },
        { name: '…', type: 'FieldProps', description: 'Everything Field accepts except layout: hint, error, success, required, disabled, readOnly, feedback.' },
      ],
    },
  ],
  a11y: [
    'The label stays a real <label for>, so it is the accessible name in every state; nothing relies on the placeholder.',
    'Placeholders are hidden until the label has floated out of the way, so text never overlaps.',
    'Floating is pure CSS (:placeholder-shown, :focus-within and :has), so it works before JavaScript loads.',
    'The resting label uses the muted text token (7:1); the floated label uses full text color.',
  ],
  classes: `.os-field[data-layout="floating"][data-float="always"] > .os-field__body > .os-field__float > (control) + .os-field__label`,
};

export default doc;

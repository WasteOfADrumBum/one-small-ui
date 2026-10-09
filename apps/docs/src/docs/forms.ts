import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'forms',
  order: 50,
  name: 'Field, Input, Textarea, Select',
  group: 'Forms',
  summary: 'Text inputs with labels, hints and errors wired up automatically. Wrap any control in Field.',
  importLine: "import { Field, Input, Textarea, Select } from 'onesmallui';",
  examples: [{ name: 'form-basic', title: 'A complete form', description: 'Submit with an invalid email to see error handling.' }],
  props: [
    {
      title: 'Field',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required. Visible label linked to the control.' },
        { name: 'hint', type: 'ReactNode', description: 'Helper text linked with aria-describedby.' },
        { name: 'error', type: 'ReactNode', description: 'Error text; sets aria-invalid and is announced.' },
        { name: 'required', type: 'boolean', description: 'Adds required to the control and "(required)" for screen readers.' },
        { name: 'hideLabel', type: 'boolean', description: 'Visually hide the label (still announced).' },
      ],
    },
    {
      title: 'Input',
      props: [
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
        { name: 'startAdornment / endAdornment', type: 'ReactNode', description: 'Icons or units inside the field.' },
        { name: '...rest', type: 'InputHTMLAttributes', description: 'Every native input prop.' },
      ],
    },
    {
      title: 'Textarea',
      props: [
        { name: 'autoResize', type: 'boolean', description: 'Grow with content.' },
        { name: 'maxRows', type: 'number', default: '12', description: 'Growth limit.' },
      ],
    },
    {
      title: 'Select',
      props: [
        { name: 'options', type: '{ value, label, disabled? }[]', description: 'Options as data, or pass <option> children.' },
        { name: 'placeholder', type: 'string', description: 'Disabled first option.' },
      ],
    },
  ],
  a11y: [
    'Every control gets a programmatic label, and hints and errors are linked with aria-describedby.',
    'Select stays a native <select>, keeping mobile pickers and full screen reader support.',
    'Borders on controls meet 3:1 non-text contrast; placeholder text meets 7:1.',
    'Use autocomplete attributes (1.3.5) as shown in the example.',
  ],
  classes: '.os-field > .os-field__label + .os-input > .os-input__control',
};

export default doc;

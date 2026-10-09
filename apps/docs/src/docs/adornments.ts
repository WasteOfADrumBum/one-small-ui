import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'adornments',
  order: 56,
  name: 'Form adornments',
  group: 'Forms',
  summary: 'Icons, text and small buttons inside Input (start and end) and Select (start), integrated with Field labels and sizes.',
  importLine: "import { Input, Select } from 'onesmallui';",
  examples: [{ name: 'adornments-basic', title: 'Icons, text, buttons and sizing' }],
  props: [
    {
      title: 'Input / Select',
      props: [
        { name: 'startAdornment', type: 'ReactNode', description: 'Inside the start of the control.' },
        { name: 'endAdornment', type: 'ReactNode', description: 'Input only: inside the end; may hold a small button.' },
        { name: '--os-adornment-size', type: 'CSS length', default: '1.15rem', description: 'Icon size inside adornments.' },
      ],
    },
  ],
  a11y: [
    'String and number adornments ("kg") are linked to the input with aria-describedby; icons are decorative (aria-hidden).',
    'Buttons inside adornments are real buttons with a 44px hit area and a focus ring; use aria-pressed for toggles.',
    'Pressing an adornment or the control padding focuses the input.',
  ],
  classes: '.os-input > .os-input__adornment[data-position="start|end"]\n.os-select[data-adorned] > .os-select__adornment',
};

export default doc;

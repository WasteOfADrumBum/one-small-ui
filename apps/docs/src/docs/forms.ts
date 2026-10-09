import type { ComponentDoc } from '../site/docTypes';

const variant = "'default' | 'ghost' | 'plaintext'";

const doc: ComponentDoc = {
  slug: 'forms',
  order: 50,
  name: 'Form controls',
  group: 'Forms',
  summary:
    'Text inputs, textareas, selects, native date, time, color and file pickers, and datalists, in four sizes with ghost, read-only and plain-text styles. Wrap any control in Field for its label, help text and feedback.',
  importLine: "import { Field, Input, Textarea, Select } from 'onesmallui';",
  examples: [
    { name: 'form-basic', title: 'A complete form', description: 'Submit with an invalid email to see error handling.' },
    { name: 'form-text-inputs', title: 'Text inputs and textareas', description: 'Native input types keep the right mobile keyboards and autofill.' },
    {
      name: 'form-select',
      title: 'Selects',
      description: 'Native selects: single with a placeholder, multiple, and a visible list (htmlSize). Options with a group render in an <optgroup>.',
    },
    {
      name: 'form-pickers',
      title: 'Date, time, color and file inputs',
      description: 'Styled native pickers: date, time, datetime-local, month, week, color and file. For a custom calendar, see DatePicker; for drag and drop, see DropZone.',
    },
    { name: 'form-datalist', title: 'Datalists', description: 'suggestions renders a <datalist> the browser shows as autocomplete options.' },
    { name: 'form-sizes', title: 'Sizes', description: 'xs, sm, md (44px, the default) and lg. Small sizes keep a 44px pointer target.' },
    { name: 'form-ghost', title: 'Ghost controls', description: 'Underlined until hovered or focused, for inline editing in dense UIs.' },
    {
      name: 'form-states',
      title: 'Help text, disabled, read-only and plain text',
      description: 'Plain text shows a read-only value as text, still focusable and selectable.',
    },
  ],
  props: [
    {
      title: 'Input',
      props: [
        { name: 'type', type: 'string', default: "'text'", description: 'Any native type, including date, time, datetime-local, month, week, color and file.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height. Inherits from a surrounding InputGroup.' },
        { name: 'variant', type: variant, default: "'default'", description: 'Ghost is borderless until hover or focus; plaintext is read-only text.' },
        { name: 'startAdornment / endAdornment', type: 'ReactNode', description: 'Icons, text or small buttons inside the control. See Adornments.' },
        { name: 'suggestions', type: 'string[]', description: 'Renders a linked <datalist>.' },
        { name: 'invalid / valid', type: 'boolean', description: 'Force the error or success style (Field sets these for you).' },
        { name: 'controlClassName', type: 'string', description: 'Class for the inner <input>; className goes on the wrapper.' },
        { name: '...rest', type: 'InputHTMLAttributes', description: 'Every native input prop, forwarded to the <input> (as is the ref).' },
      ],
    },
    {
      title: 'Textarea',
      props: [
        { name: 'autoResize', type: 'boolean', description: 'Grow with content.' },
        { name: 'maxRows', type: 'number', default: '12', description: 'Growth limit.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", description: 'Text size and padding.' },
        { name: 'variant', type: variant, default: "'default'", description: 'Ghost or plain text.' },
        { name: 'invalid / valid', type: 'boolean', description: 'Error or success style.' },
      ],
    },
    {
      title: 'Select',
      props: [
        { name: 'options', type: '{ value, label, disabled?, group? }[]', description: 'Options as data, or pass <option> children.' },
        { name: 'placeholder', type: 'string', description: 'Disabled first option (single selects).' },
        { name: 'multiple', type: 'boolean', description: 'Native multi-select list box.' },
        { name: 'htmlSize', type: 'number', description: 'Visible rows (the native size attribute).' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
        { name: 'variant', type: "'default' | 'ghost'", default: "'default'", description: 'Ghost style.' },
        { name: 'startAdornment', type: 'ReactNode', description: 'Decorative icon inside the start.' },
      ],
    },
  ],
  a11y: [
    'Every control gets a programmatic label from Field, and help text and errors are linked with aria-describedby.',
    'Date, time, color, file and select controls stay native, so mobile pickers, keyboard support and screen readers work as users expect.',
    'Control borders meet 3:1 non-text contrast and placeholder text meets 7:1. Ghost controls keep a 3:1 underline so they are still recognisable as fields.',
    'xs and sm controls are shorter than 44px but extend their pointer target to 44px (WCAG 2.5.5).',
    'Read-only and plain-text controls stay focusable and are announced as read only; disabled ones are skipped by Tab.',
    'Use autocomplete attributes (1.3.5) for personal data, as in the examples.',
  ],
  classes: `.os-input[data-size="xs|sm|md|lg"][data-variant="ghost|plaintext"][data-type][data-invalid][data-valid][data-readonly][data-disabled]
.os-input > .os-input__adornment[data-position="start|end"] + .os-input__control
.os-textarea[data-size][data-variant][data-invalid][data-valid]
.os-select[data-size][data-variant][data-multiple][data-adorned] > .os-select__control + .os-select__chevron`,
};

export default doc;

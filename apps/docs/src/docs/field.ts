import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'field',
  order: 51,
  name: 'Field & FieldGroup',
  group: 'Forms',
  summary:
    'Field wires a label, control, description and feedback together; FieldGroup groups related controls in a fieldset with a legend, optionally as a card. Labels go above, beside or inline, and feedback below or as a bubble.',
  importLine: "import { Field, FieldGroup, FloatingLabel, useFieldControl, useFieldContext } from 'onesmallui';",
  examples: [
    { name: 'field-layouts', title: 'Label layouts', description: 'Overhead (default), inline, and horizontal with a fixed label column.' },
    { name: 'field-groups', title: 'Grouped controls and group cards', description: 'A fieldset with a legend, and one rendered as a card with a grid layout.' },
    {
      name: 'field-check-layouts',
      title: 'Checkbox, radio and switch layouts',
      description: 'Stacked, inline and card layouts. Cards make the whole tile the hit area.',
    },
    {
      name: 'field-feedback',
      title: 'Feedback placement',
      description: 'Error and success messages below the control, or as a tooltip-style bubble anchored to it.',
    },
  ],
  props: [
    {
      title: 'Field',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required. Visible label linked to the control.' },
        { name: 'hint / description', type: 'ReactNode', description: 'Help text linked with aria-describedby.' },
        { name: 'error', type: 'ReactNode', description: 'Error text; sets aria-invalid and is announced politely. Without it, the browser validation message is shown after a submit attempt.' },
        { name: 'success', type: 'ReactNode', description: 'Success text; marks the control valid and is announced.' },
        { name: 'valid', type: 'boolean', description: 'Success style without a message.' },
        { name: 'layout', type: "'vertical' | 'horizontal' | 'inline' | 'floating'", default: "'vertical'", description: 'Where the label sits. See Floating labels for the last one.' },
        { name: 'labelWidth', type: 'string', default: "'10rem'", description: 'Label column width for horizontal layouts (--os-field-label-width).' },
        { name: 'feedback', type: "'below' | 'tooltip'", default: "'below'", description: 'Feedback as text or as a bubble under the control.' },
        { name: 'alwaysFloat', type: 'boolean', description: 'Floating layout: keep the label raised.' },
        { name: 'required / disabled / readOnly', type: 'boolean', description: 'Passed to the control; required adds a visible * and "(required)" for screen readers.' },
        { name: 'hideLabel', type: 'boolean', description: 'Visually hide the label (still announced).' },
        { name: 'id', type: 'string', description: 'Override the generated control id.' },
      ],
    },
    {
      title: 'FieldGroup',
      props: [
        { name: 'legend', type: 'ReactNode', description: 'Required. The fieldset legend, announced when focus enters the group.' },
        { name: 'description', type: 'ReactNode', description: 'Help text for the group.' },
        { name: 'error', type: 'ReactNode', description: 'Group-level error, announced politely.' },
        { name: 'variant', type: "'plain' | 'card'", default: "'plain'", description: 'Card draws a bordered panel with the legend as its header.' },
        { name: 'layout', type: "'stack' | 'inline' | 'grid'", default: "'stack'", description: 'How children are arranged.' },
        { name: 'minItemWidth', type: 'string', default: "'14rem'", description: 'Column minimum for the grid layout.' },
        { name: 'disabled', type: 'boolean', description: 'Disables every control inside (native fieldset behavior).' },
      ],
    },
    {
      title: 'useFieldControl(props)',
      props: [
        {
          name: 'returns',
          type: 'props',
          description: 'Your props merged with the Field context: id, aria-describedby, aria-invalid, required, disabled. Use it to make your own control Field-aware; useFieldContext() returns the raw context (ids, labelId, layout, states).',
        },
      ],
    },
  ],
  a11y: [
    'The label is a real <label for>, so clicking it focuses the control and it is the control’s accessible name.',
    'Help text, errors and success messages are linked with aria-describedby; errors set aria-invalid and both sit in a polite live region.',
    'Messages have an icon and text, never color alone.',
    'FieldGroup uses <fieldset> and <legend>, so the group name is announced, and disabled disables everything inside.',
    'Horizontal layouts collapse to stacked under the sm breakpoint so labels never get squeezed (1.4.10 Reflow).',
  ],
  classes: `.os-field[data-layout="vertical|horizontal|inline|floating"][data-feedback="below|tooltip"][data-invalid][data-valid][data-touched]
  > .os-field__label + .os-field__body > (control) + .os-field__hint + .os-field__live > .os-field__error | .os-field__success
.os-field-group[data-variant="plain|card"][data-layout="stack|inline|grid"] > .os-field-group__legend + .os-field-group__description + .os-field-group__body
--os-field-label-width, --os-field-group-min`,
};

export default doc;

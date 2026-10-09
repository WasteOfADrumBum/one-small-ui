import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'toggler',
  order: 90,
  name: 'Toggler',
  group: 'Utilities',
  summary:
    'A button (or hook) that toggles classes or attribute values on itself or other elements: one element, a ref, or every match of a selector.',
  importLine: "import { Toggler, useToggler } from 'onesmallui';",
  examples: [{ name: 'toggler-basic', title: 'Classes, attributes, multiple targets, disclosure and the hook' }],
  props: [
    {
      title: 'Toggler / useToggler',
      props: [
        { name: 'target', type: 'string | Element | RefObject | array', description: 'Selector (all matches), element, ref, or a list.' },
        { name: 'toggleClass', type: 'string', description: 'Space-separated classes added while pressed.' },
        { name: 'toggleAttribute', type: 'string', description: 'Attribute set while pressed.' },
        { name: 'onValue / offValue', type: 'string', default: "'' / (removed)", description: 'Attribute values when on and off.' },
        { name: 'pressed / defaultPressed / onPressedChange', type: 'boolean', description: 'Controlled or uncontrolled.' },
        { name: 'mode (Toggler)', type: "'pressed' | 'expanded'", default: "'pressed'", description: 'aria-pressed, or aria-expanded + aria-controls for disclosures.' },
        { name: '…Button props', type: 'ButtonProps', description: 'variant (default outline), color, size…' },
        { name: 'returns (useToggler)', type: '{ pressed, setPressed, toggle, controls }', description: 'controls is the targets\' ids for aria-controls.' },
      ],
    },
  ],
  reference: [
    {
      title: 'Data attributes (vanilla JS, planned)',
      columns: ['Attribute', 'Meaning'],
      rows: [
        ['data-os-toggle', 'Marks a button as a toggler.'],
        ['data-os-target', 'Selector of the element(s) to change; defaults to the button itself.'],
        ['data-os-class', 'Classes to toggle.'],
        ['data-os-attribute', 'Attribute to toggle.'],
        ['data-os-value / data-os-off-value', 'Attribute values when on / off.'],
      ],
    },
  ],
  a11y: [
    'On/off switches expose aria-pressed; show/hide disclosures use mode="expanded" for aria-expanded and aria-controls.',
    'Keep the visible label stable and let the pressed state carry the meaning, or change the label and drop aria-pressed.',
    'Changing only a class is invisible to screen readers: pair visual changes with state (hidden, aria-*) where it matters.',
  ],
  classes: '.os-btn[aria-pressed][data-state=on|off]',
};

export default doc;

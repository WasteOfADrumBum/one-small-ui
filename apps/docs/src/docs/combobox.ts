import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'combobox',
  order: 58,
  name: 'Combobox',
  group: 'Forms',
  summary:
    'A custom select menu with live search, single or multiple selection, grouped options, icons, descriptions and checkmarks, that submits with forms through hidden inputs.',
  importLine: "import { Combobox } from 'onesmallui';",
  examples: [
    { name: 'combobox-basic', title: 'Single, multiple, select-only, sizes and disabled', description: 'Preselected values and placeholders.' },
    { name: 'combobox-rich', title: 'Groups, icons, descriptions and form submission' },
  ],
  props: [
    {
      title: 'Combobox',
      props: [
        { name: 'options', type: '{ value, label, description?, icon?, group?, disabled? }[]', description: 'Options; consecutive options with the same group share a heading.' },
        { name: 'multiple', type: 'boolean', description: 'Multiple selection; values show as removable chips.' },
        { name: 'value / defaultValue', type: 'string | null (single) · string[] (multiple)', description: 'Selection.' },
        { name: 'onValueChange', type: '(value) => void', description: 'Called with the new selection.' },
        { name: 'searchable', type: 'boolean', default: 'true', description: 'Type to filter. false makes a select-only combobox.' },
        { name: 'filter', type: '(option, query) => boolean', description: 'Custom matching.' },
        { name: 'onInputChange', type: '(query) => void', description: 'For async searching.' },
        { name: 'name', type: 'string', description: 'Submits the value(s) as hidden inputs.' },
        { name: 'placeholder / emptyMessage / resultsMessage', type: '…', description: 'Texts.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'bottom-start'", description: 'Where the list opens (flips when there is no room).' },
        { name: 'disabled / required / invalid', type: 'boolean', description: 'States (Field sets them).' },
      ],
    },
  ],
  a11y: [
    'Follows the WAI-ARIA combobox pattern with a listbox popup: role="combobox", aria-expanded, aria-controls and aria-activedescendant keep focus in the input.',
    'Down/Up open and move, Alt+Down opens without moving, Page Up/Down jump, Enter selects, Escape closes (and clears the query when closed), Backspace removes the last chip in multiple mode.',
    'Options have role="option" with aria-selected, groups are role="group" labelled by their heading, and disabled options are skipped.',
    'The number of results is announced politely while typing; selection is shown by a check mark and weight, not color.',
    'The list renders in the top layer, so no overflow or z-index can clip it.',
  ],
  classes: `.os-combobox[data-size][data-state="open|closed"][data-multiple][data-invalid] > .os-combobox__control > .os-chip* + .os-combobox__input + .os-combobox__chevron
.os-combobox__popup.os-floating > .os-combobox__listbox > .os-combobox__group > .os-combobox__group-label + .os-combobox__option[data-active][aria-selected]`,
};

export default doc;

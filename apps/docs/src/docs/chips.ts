import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'chips',
  order: 57,
  name: 'Chip, ChipGroup, ChipInput',
  group: 'Forms',
  summary:
    'Compact tags and selected values with icons and avatars, theme colors, dismiss buttons, toggle (filter) chips, and a multi-value chip input.',
  importLine: "import { Chip, ChipGroup, ChipInput } from 'onesmallui';",
  examples: [
    { name: 'chips-basic', title: 'Tags, colors, icons, avatars and dismissible chips' },
    { name: 'chips-input', title: 'Toggle chips and chip input', description: 'Selectable groups use aria-pressed; ChipInput turns typed text into chips.' },
  ],
  props: [
    {
      title: 'Chip',
      props: [
        { name: 'color', type: color, default: "'neutral'", description: 'Theme color.' },
        { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Fill style.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height and text size.' },
        { name: 'icon / avatar', type: 'ReactNode', description: 'Leading media.' },
        { name: 'selected / onSelectedChange', type: 'boolean / (b) => void', description: 'Makes the chip a toggle button (aria-pressed).' },
        { name: 'onRemove / removeLabel', type: '() => void / string', description: 'Shows a remove button, named "Remove <text>".' },
        { name: 'value', type: 'string', description: 'Value inside a selectable ChipGroup (defaults to the text).' },
        { name: 'disabled', type: 'boolean', description: 'Disables toggle and remove.' },
      ],
    },
    {
      title: 'ChipGroup',
      props: [
        { name: 'selectionMode', type: "'none' | 'single' | 'multiple'", default: "'none'", description: 'Turns chips into toggles.' },
        { name: 'value / defaultValue / onValueChange', type: 'string[]', description: 'Pressed chip values.' },
        { name: 'color / variant / size / disabled', type: '…', description: 'Defaults for the chips inside.' },
      ],
    },
    {
      title: 'ChipInput',
      props: [
        { name: 'value / defaultValue / onValueChange', type: 'string[]', description: 'The chips.' },
        { name: 'separators', type: 'string[]', default: "[',']", description: 'Keys that commit a chip besides Enter.' },
        { name: 'validate', type: '(v) => boolean | string', description: 'Reject values; a string is shown and announced.' },
        { name: 'max / allowDuplicates', type: 'number / boolean', description: 'Limits.' },
        { name: 'name', type: 'string', description: 'Submits one hidden input per chip.' },
        { name: 'placeholder / size / color / disabled / invalid', type: '…', description: 'Look and state.' },
      ],
    },
  ],
  a11y: [
    'Toggle chips are buttons with aria-pressed and show a check mark, so selection is not color alone.',
    'Remove buttons are labelled "Remove <name>" and have a 44px hit area.',
    'In a ChipGroup or ChipInput, arrow keys move between chips, Home/End jump, and Delete or Backspace removes the focused chip.',
    'ChipInput announces "Added …" and "Removed …" politely; pasted comma lists are split into chips.',
  ],
  classes: `.os-chip-group
.os-chip[data-color][data-variant][data-size][data-selected][data-removable][data-disabled] > .os-chip__main (> .os-chip__check, .os-chip__avatar, .os-chip__icon, .os-chip__label) + .os-chip__remove
.os-chip-input[data-size][data-invalid] > .os-chip* + .os-chip-input__control`,
};

export default doc;

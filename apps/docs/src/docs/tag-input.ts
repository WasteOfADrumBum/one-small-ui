import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tag-input',
  order: 57.5,
  name: 'TagInput',
  group: 'Forms',
  summary:
    'A text input that turns entries into removable tags, with delimiters, paste splitting, dedupe, limits, validation, optional suggestions (free or suggestions-only) and native form submission. Replaces the deprecated ChipInput.',
  importLine: "import { TagInput } from '@onesmall/ui';",
  examples: [
    {
      name: 'tag-input-basic',
      title: 'Free entry, validation, limits, read only and disabled',
      description: 'Enter or comma adds the typed text; pasted lists are split. An invalid email stays in the input with its message below.',
    },
    {
      name: 'tag-input-suggestions',
      title: 'Suggestions and suggestions-only mode in a form',
      description: 'With suggestions the input becomes a combobox. The second field accepts only listed teams and is required until one is added.',
    },
  ],
  props: [
    {
      title: 'TagInput',
      props: [
        { name: 'value / defaultValue', type: 'string[]', description: 'The tags (controlled / uncontrolled).' },
        { name: 'onValueChange', type: '(value: string[]) => void', description: 'Called with the new list after an add or remove.' },
        { name: 'delimiters', type: 'string[]', default: "['Enter', ',']", description: 'Keys that commit the typed text. Single characters also split pastes; newlines always do.' },
        { name: 'suggestions', type: 'string[] | ComboboxOption[]', description: 'Options listed as the user types, filtered by the text, without tags already added. Tags store option values and show labels.' },
        { name: 'mode', type: "'free' | 'suggestions-only'", default: "'free'", description: 'suggestions-only rejects text that matches no suggestion.' },
        { name: 'filter', type: '(option, text) => boolean', description: 'Custom suggestion matching. Default: label contains the text, ignoring case.' },
        { name: 'dedupe', type: "boolean | 'case-insensitive'", default: "'case-insensitive'", description: 'true skips exact duplicates only; false allows duplicates.' },
        { name: 'maxTags', type: 'number', description: 'Maximum number of tags. Reaching it is announced.' },
        { name: 'validate', type: '(tag, tags) => boolean | string', description: 'Return true to accept, or a message (or false) to reject. The message shows under the input and marks it invalid.' },
        { name: 'name', type: 'string', description: 'Submits one hidden input per tag.' },
        { name: 'required', type: 'boolean', description: 'Blocks submission until at least one tag is added (Field sets it).' },
        { name: 'disabled / readOnly / invalid', type: 'boolean', description: 'States (Field sets them). Read-only tags have no remove buttons.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
        { name: 'color', type: color, description: 'Tag color.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'bottom-start'", description: 'Where the suggestion list opens.' },
        { name: 'placeholder / emptyMessage', type: 'string / ReactNode', description: 'Texts. The placeholder hides when the limit is reached.' },
        { name: 'onInputChange', type: '(text) => void', description: 'Called with the typed text, for loading suggestions.' },
        { name: 'messages', type: 'Partial<TagInputMessages>', description: 'Translate every announcement, notice and remove-button label (removeLabel, added, removed, limitReached, duplicate, invalid, notInSuggestions, results).' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Enter / ,', action: 'Adds the typed text as a tag (or the highlighted suggestion). Enter in an empty input submits the form.' },
    { keys: 'Backspace', action: 'In the empty input, removes the last tag.' },
    { keys: 'Left Arrow', action: 'At the start of the input, moves focus to the last tag (Right Arrow in right-to-left layouts).' },
    { keys: 'Left Arrow / Right Arrow', action: 'On a tag, moves between tags; past the last tag returns to the input. Mirrored in right-to-left layouts.' },
    { keys: 'Home / End', action: 'On a tag, jumps to the first or last tag.' },
    { keys: 'Delete / Backspace', action: 'On a tag, removes it and moves focus to the next tag or the input.' },
    { keys: 'Down Arrow / Up Arrow', action: 'With suggestions: opens the list and moves the highlight.' },
    { keys: 'Escape', action: 'Closes the suggestion list; with it closed, clears the typed text.' },
  ],
  screenReader: [
    'Inside a Field the input is labelled by the label and described by the description and error. Without one, pass aria-label.',
    'With suggestions the input has role="combobox" with aria-expanded, aria-controls and aria-activedescendant, so focus stays in the input while the highlight moves through the listbox. Without suggestions it is a plain text box.',
    'Each tag has a remove button named "Remove tag: Design".',
    'Adds ("Added tag: Design."), removes, and "Tag limit reached" are announced politely through useAnnouncer, as is the number of suggestions while typing. Rejections are announced assertively.',
    'Validation and suggestions-only rejections appear under the input, linked with aria-describedby, and set aria-invalid. Duplicates and the limit appear there too, without marking the input invalid.',
    'When required, the text input carries required only while there are no tags, so native validation and Field messages work; afterwards aria-required keeps the field announced as required.',
  ],
  dos: [
    'Put it in a Field so the label, description, required state and errors are wired for you.',
    'Use mode="suggestions-only" when tags must come from a fixed set, such as teams or categories.',
    'Say how to add tags in the description ("Press Enter or comma to add").',
    'Give validate a message that says how to fix the tag, not just that it is wrong.',
  ],
  donts: [
    "Don't use it for picking from a short fixed list with no typing; use Combobox with multiple or a ChipGroup.",
    "Don't put the error in a placeholder; it disappears as soon as the user types.",
    "Don't use ChipInput in new code: it is deprecated in favour of TagInput, which uses delimiters, maxTags and dedupe instead of separators, max and allowDuplicates.",
  ],
  a11y: [
    'Follows the WAI-ARIA combobox pattern (list autocomplete) when suggestions are given; in free mode nothing is highlighted until the user arrows into the list, so Enter adds what was typed.',
    'Remove buttons have a 44px hit area; the control is at least 44px tall at the default size.',
    'States are not shown by color alone: errors have text, read-only tags drop their remove buttons and the border turns dashed.',
    'Built with logical properties, so the layout and arrow keys mirror in right-to-left documents.',
  ],
  classes: `.os-tag-input[data-size][data-state="open|closed"][data-invalid][data-disabled][data-readonly][data-full]
  > .os-tag-input__control > .os-chip* + .os-tag-input__input
  + .os-combobox__popup.os-tag-input__popup.os-floating > .os-combobox__listbox > .os-combobox__option[data-active]
  + .os-tag-input__notice[data-kind="error|info"]`,
};

export default doc;

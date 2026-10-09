import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'input-group',
  order: 54,
  name: 'InputGroup',
  group: 'Forms',
  summary:
    'Attach text, icons, buttons, segmented buttons, menu buttons, checkboxes and radios to inputs, selects, textareas and file inputs. Inner corners are squared and borders shared automatically.',
  importLine: "import { InputGroup, InputGroupText } from 'onesmallui';",
  examples: [
    { name: 'input-group-text', title: 'Leading and trailing text', description: 'Works with inputs, selects, file inputs and textareas.' },
    {
      name: 'input-group-buttons',
      title: 'Buttons, button groups, segmented and menu buttons',
      description: 'Use the regular Button. The menu button here opens a native popover positioned with useFloating.',
    },
    { name: 'input-group-checks', title: 'Checkbox and radio add-ons, multiple inputs', description: 'as="label" makes the whole add-on toggle its checkbox or radio.' },
    { name: 'input-group-sizes', title: 'Sizes', description: 'The group size flows to its inputs, selects, textareas, add-ons and buttons.' },
  ],
  props: [
    {
      title: 'InputGroup',
      props: [
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", description: 'Size for every control, add-on and button inside.' },
        { name: 'wrap', type: 'boolean', description: 'Allow items to wrap on narrow screens.' },
        { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', description: 'Add role="group" and a label when the group holds several controls.' },
      ],
    },
    {
      title: 'InputGroupText',
      props: [
        { name: 'as', type: 'ElementType', default: "'span'", description: "Use 'label' to label the input (with htmlFor) or to wrap a checkbox or radio." },
        { name: 'children', type: 'ReactNode', description: 'Text, an icon or a native checkbox/radio.' },
      ],
    },
  ],
  a11y: [
    'Add-on text is visual. Put the meaning in the label too ("Price in credits"), or link the add-on with aria-describedby.',
    'When a group holds several controls, give it role="group" and an aria-label so it is announced as one unit; label every control.',
    'Checkbox and radio add-ons wrapped in a label have a full-height hit area of at least 44px.',
    'The focused item draws above its neighbours so the focus ring is never clipped.',
    'Toggle buttons used as a segmented control expose aria-pressed.',
  ],
  classes: `.os-input-group[data-size][data-wrap] > (.os-input | .os-select | .os-textarea | .os-field | .os-combobox | .os-datepicker | .os-btn | .os-input-group__text)`,
};

export default doc;

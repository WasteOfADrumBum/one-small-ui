import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'otp-input',
  order: 60,
  name: 'OtpInput',
  group: 'Forms',
  summary:
    'Verification-code and PIN entry: one slot per character, separate or connected slots with separators, sizes, alphanumeric codes, masking, and disabled and invalid states.',
  importLine: "import { OtpInput } from 'onesmallui';",
  examples: [{ name: 'otp-basic', title: 'Codes, PINs, alphanumeric, connected and disabled' }],
  props: [
    {
      title: 'OtpInput',
      props: [
        { name: 'length', type: 'number', default: '6', description: 'Number of slots.' },
        { name: 'value / defaultValue / onValueChange', type: 'string', description: 'The code.' },
        { name: 'onComplete', type: '(code) => void', description: 'Called when every slot is filled.' },
        { name: 'type', type: "'numeric' | 'alphanumeric'", default: "'numeric'", description: 'Allowed characters (letters are upper-cased).' },
        { name: 'mask', type: 'boolean', description: 'Hide characters (PINs).' },
        { name: 'variant', type: "'separate' | 'connected'", default: "'separate'", description: 'Slot style.' },
        { name: 'groupSize', type: 'number', description: 'Separator after every n slots.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Slot size.' },
        { name: 'name', type: 'string', description: 'Submits the whole code in one hidden input.' },
        { name: 'disabled / invalid', type: 'boolean', description: 'States (Field sets them).' },
        { name: 'slotLabel', type: '(index, length) => string', default: '"Character 1 of 6"', description: 'Name of each slot.' },
      ],
    },
  ],
  a11y: [
    'The slots are one role="group" labelled by the Field label (or aria-label); each slot is named "Character n of N".',
    'The first slot has autocomplete="one-time-code" so phones offer SMS codes; numeric codes use the numeric keypad.',
    'Typing advances, Backspace clears and goes back, arrows/Home/End move, and pasting fills every slot.',
    'Slots are at least 44px and errors from Field are linked to the group and announced.',
  ],
  classes: '.os-otp[data-variant="separate|connected"][data-size][data-invalid][data-complete] > .os-otp__slot[data-filled] + .os-otp__separator',
};

export default doc;

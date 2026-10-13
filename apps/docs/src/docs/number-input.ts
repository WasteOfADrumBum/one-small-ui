import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'number-input',
  order: 53.5,
  name: 'NumberInput',
  group: 'Forms',
  summary:
    'A number field with role="spinbutton": arrow keys and press-and-hold buttons step the value, it shows locale formatting (currency, percent, units) when blurred and the plain number while editing, clamps on blur and submits the raw number.',
  importLine: "import { NumberInput } from '@onesmall/ui';",
  examples: [
    {
      name: 'number-input-basic',
      title: 'Bounds, steps and states',
      description: 'Controlled and uncontrolled, a fractional step, read-only and disabled. Hold a button to repeat.',
    },
    {
      name: 'number-input-formatting',
      title: 'Currency, percent, units and locales',
      description: 'Focus a field to edit the raw number; blur it to see the formatted value again.',
    },
    {
      name: 'number-input-form',
      title: 'In a form',
      description: 'FormData gets the plain number (budget=2500), never the formatted "$2,500.00".',
    },
  ],
  props: [
    {
      title: 'NumberInput',
      props: [
        { name: 'value / defaultValue', type: 'number | null', default: 'null', description: 'The number, or null when empty. Percent values follow Intl: 0.25 is shown as 25%.' },
        { name: 'onValueChange', type: '(value: number | null) => void', description: 'Called while typing (unclamped), on every step, and with the clamped value on blur.' },
        { name: 'min / max', type: 'number', description: 'Bounds. Applied on blur and Enter, and by stepping; never while typing. Home/End jump to them.' },
        { name: 'step', type: 'number', default: '1 (0.01 for percent)', description: 'Arrow keys and buttons. Off-grid values snap to the next step from min (or 0).' },
        { name: 'largeStep', type: 'number', default: '10 × step', description: 'Page Up / Page Down.' },
        { name: 'precision', type: 'number', description: 'Decimal places the value is rounded to on blur and when stepping. Defaults to the step’s decimals, so 0.1 + 0.2 is 0.3.' },
        { name: 'formatOptions', type: 'Intl.NumberFormatOptions', description: "Display format when blurred: { style: 'currency', currency: 'EUR' }, { style: 'percent' }, { style: 'unit', unit: 'kilogram' }." },
        { name: 'locale', type: 'string', default: 'runtime locale', description: 'Formats the value and sets which group and decimal separators typing understands. Set it for server rendering so server and browser agree.' },
        { name: 'startAdornment / endAdornment', type: 'ReactNode', description: 'Prefix and suffix inside the control. Text is linked to the input with aria-describedby.' },
        { name: 'allowWheel', type: 'boolean', default: 'false', description: 'Let the mouse wheel step the value, only while the input is focused (the page does not scroll then).' },
        { name: 'hideStepper', type: 'boolean', default: 'false', description: 'Hide the increment and decrement buttons. The keys still work.' },
        { name: 'incrementLabel / decrementLabel', type: 'string', default: "'Increase' / 'Decrease'", description: 'Accessible names of the buttons. Make them specific: "Add guest".' },
        { name: 'clampAnnouncement', type: "(formatted, bound: 'min' | 'max') => string", default: '"Adjusted to the maximum, 120"', description: 'Read politely when blur clamps a typed value.' },
        { name: 'name', type: 'string', description: 'Submits the raw number ("1234.5") in a hidden input. Empty submits "". Disabled submits nothing.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height (inherits from InputGroup).' },
        { name: 'disabled / readOnly / required / invalid', type: 'boolean', description: 'States. Field sets them.' },
        { name: 'controlClassName', type: 'string', description: 'Class for the inner <input>; className goes on the wrapper.' },
        { name: '...rest', type: 'InputHTMLAttributes', description: 'Go to the visible <input> (placeholder, aria-label, autoFocus, inputMode). The ref is the input.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Arrow Up / Arrow Down', action: 'Increase / decrease by step (stops at the bounds).' },
    { keys: 'Page Up / Page Down', action: 'Increase / decrease by largeStep.' },
    { keys: 'Home / End', action: 'Set the minimum / maximum, when min / max are set. Otherwise they move the caret.' },
    { keys: 'Enter', action: 'Commit: parse, round and clamp the typed text. In a form, also submits.' },
    { keys: 'Tab', action: 'Moves past the field. The stepper buttons are not in the tab order; the keys do the same job.' },
  ],
  screenReader: [
    'Announced as a spin button with its label, value and range: aria-valuenow, aria-valuemin and aria-valuemax.',
    'When the display is formatted, aria-valuetext carries it, so "$1,234.50" or "25%" is read rather than 1234.5 or 0.25.',
    'Hint, error and text adornments are linked with aria-describedby; Field sets aria-invalid and required.',
    'When blur clamps a typed value, a polite message says so ("Adjusted to the maximum, 120") through useAnnouncer.',
    'The buttons have aria-label and aria-controls, so screen reader users can still activate them from browse mode.',
  ],
  dos: [
    'Use it for quantities that people adjust: counts, money, measurements, percentages.',
    'Give min and max when they exist, so Home/End work and the range is announced.',
    'Pass a locale and formatOptions for money and units, and store the raw number.',
    'Name the buttons for the task with incrementLabel / decrementLabel when "Increase" is vague.',
  ],
  donts: [
    "Don't use it for numbers that aren't amounts, like phone numbers, card numbers or ZIP codes. Use Input or OtpInput.",
    "Don't enable allowWheel inside long scrolling pages unless people expect it; it is off by default for that reason.",
    "Don't put a currency symbol in startAdornment and in formatOptions at the same time.",
    "Don't rely on typing a minus on iOS with the decimal keypad; pass inputMode=\"text\" when negatives are common.",
  ],
  a11y: [
    'A real <input type="text" inputmode="decimal" role="spinbutton">, so mobile shows a numeric keypad and the value is still free text (locale separators, pasted "$1,234").',
    'Clamping waits for blur or Enter: correcting a value while someone types moves the caret and loses input.',
    'Stepper buttons are tabIndex -1 and keep focus in the input; each is at least 44×44px (extended with ::after on short sizes).',
    'Press-and-hold waits 400ms, then repeats every 60ms; it stops on release, leave, cancel, blur and at the bounds.',
    'Parsing follows the locale: in de-DE "1.234,5" is 1234.5, and native digits (١٢٣) work. Unparseable text restores the last value on blur.',
  ],
  classes: `.os-input.os-number-input[data-size][data-invalid][data-valid][data-disabled][data-readonly][data-hide-stepper]
  > .os-input__adornment[data-position="start"] + .os-input__control.os-number-input__control[role="spinbutton"]
  + .os-input__adornment[data-position="end"] + .os-number-input__stepper > .os-number-input__button[data-direction="decrement|increment"]`,
};

export default doc;

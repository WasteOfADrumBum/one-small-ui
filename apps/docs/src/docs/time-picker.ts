import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'time-picker',
  order: 59.5,
  name: 'TimePicker',
  group: 'Forms',
  summary:
    'A time field you can type into (9, 930, 9:30p, 21:30) or pick from a list at step intervals. 12- or 24-hour display from the locale, min/max and disabled times, and an HH:mm value that pairs with DatePicker.',
  importLine: "import { TimePicker, parseTime, formatTime, getTimeOptions } from '@onesmall/ui';",
  examples: [
    {
      name: 'time-picker-basic',
      title: 'Typed or picked, 12 or 24 hour',
      description: 'The second field forces a 24-hour clock, lists every 30 minutes and opens a dark list.',
    },
    {
      name: 'time-picker-constraints',
      title: 'Opening hours with a blocked lunch',
      description: 'min, max and step shape the list; isTimeDisabled blocks times. Typed times outside them are marked invalid and announced.',
    },
    {
      name: 'time-picker-with-date',
      title: 'Paired with DatePicker',
      description:
        'Both use the same prop names and plain string values (yyyy-mm-dd and HH:mm), so a date and a time join into one ISO local date-time.',
    },
  ],
  props: [
    {
      title: 'TimePicker (also takes input attributes such as placeholder, required, aria-label)',
      props: [
        { name: 'value / defaultValue', type: 'string | null', description: 'HH:mm, 24-hour, whatever the display. null for no time.' },
        { name: 'onValueChange', type: '(value: string | null) => void', description: 'Called with HH:mm, or null when cleared or when the typed text is invalid.' },
        { name: 'step', type: 'number', default: '15', description: 'Minutes between listed times, counted from min. Typed times between steps are accepted.' },
        { name: 'min / max', type: 'string (HH:mm)', default: "'00:00' / '23:59'", description: 'Earliest and latest time.' },
        { name: 'isTimeDisabled', type: '(value: string) => boolean', description: 'Blocks specific times. Mirrors DatePicker’s isDateDisabled.' },
        { name: 'hourCycle', type: "'h12' | 'h23'", default: 'from locale', description: 'Display clock. Read from Intl.DateTimeFormat resolvedOptions().hourCycle.' },
        { name: 'locale', type: 'string', default: 'runtime', description: 'Display locale.' },
        { name: 'name', type: 'string', description: 'Submits the HH:mm value through a hidden input.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'bottom-start'", description: 'List placement.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'List look.' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'List state.' },
        { name: 'messages', type: '{ invalid?, outOfRange?, unavailable? }', description: 'Validation messages, announced and shown through Field.' },
        { name: 'toggleLabel / listLabel', type: 'string', description: 'Names for the clock button and the list (the list uses the Field label when there is one).' },
        { name: 'size / disabled / readOnly / invalid', type: '…', description: 'Look and states. Also taken from Field.' },
      ],
    },
    {
      title: 'Helpers (pure, safe on the server)',
      props: [
        { name: 'parseTime(text)', type: 'string | null', description: 'Reads typed text into HH:mm. 12am is 00:00, 12pm is 12:00; 24:00 is rejected.' },
        { name: 'formatTime(value, { locale, hourCycle })', type: 'string', description: 'Display text for an HH:mm value.' },
        { name: 'timeToMinutes(value) / minutesToTime(n)', type: 'number / string', description: 'HH:mm ↔ minutes since midnight.' },
        { name: 'getTimeOptions({ step, min, max })', type: 'string[]', description: 'The listed times.' },
        { name: 'getHourCycle(locale)', type: "'h12' | 'h23'", description: 'The locale’s clock.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Down Arrow / Alt + Down Arrow', action: 'Opens the list on the selected time, the time typed, or the time nearest to now. In the list: next time. Arrows skip disabled times.' },
    { keys: 'Up Arrow', action: 'Opens the list. In the list: previous time.' },
    { keys: 'Alt + Up Arrow', action: 'Closes the list.' },
    { keys: 'Page Down / Page Up', action: 'In the list: an hour later or earlier.' },
    { keys: 'Home / End', action: 'In the list: first or last time. Closed: moves the caret.' },
    { keys: 'Enter', action: 'Selects the highlighted time, or applies the typed text.' },
    { keys: 'Escape', action: 'Closes the list; pressed again, reverts the typed text.' },
    { keys: 'Tab', action: 'Applies the typed text and moves on.' },
  ],
  screenReader: [
    'The input is a combobox (aria-haspopup="listbox", aria-expanded, aria-controls). Focus stays in it; aria-activedescendant points at the highlighted time, so each one is read as you arrow.',
    'Selected times have aria-selected="true"; disabled times aria-disabled="true".',
    'Invalid, out-of-range or unavailable text is announced politely and set as the input’s validation message, so Field shows it, links it with aria-describedby and the form won’t submit.',
    'The clock button is out of the tab order, as in the APG combobox; its name says the current time ("Change time, 9:30 AM").',
  ],
  dos: [
    'Put it in a Field so the input and the list share the label.',
    'Store the HH:mm value and format it for display with formatTime.',
    'Pair it with DatePicker for dates and times; join yyyy-mm-dd and HH:mm yourself.',
  ],
  donts: [
    "Don't set a step that hides common times (use 15 or 30 minutes for appointments).",
    "Don't rely on the list alone for odd times: people can type 9:37.",
    "Don't use min after max for overnight ranges: the list runs within one day.",
  ],
  a11y: [
    'Follows the WAI-ARIA combobox pattern with a listbox popup; every pointer action has a key.',
    'Options and the clock button are at least 44 × 44px. The highlighted time has an outline as well as a fill; disabled times are struck through, not only dimmed.',
    'Display text always reads back: what the field shows can be typed again.',
  ],
  classes: `.os-timepicker[data-state][data-disabled] > .os-timepicker__anchor > .os-input > .os-input__control[role=combobox] + .os-input__adornment > .os-timepicker__toggle
.os-timepicker__popup.os-floating[data-os-theme][data-appearance] > .os-timepicker__listbox > .os-timepicker__option[data-active][aria-selected][aria-disabled] > .os-timepicker__check + .os-timepicker__label`,
};

export default doc;

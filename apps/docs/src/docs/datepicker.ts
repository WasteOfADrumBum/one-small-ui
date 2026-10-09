import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'datepicker',
  order: 59,
  name: 'DatePicker & Calendar',
  group: 'Forms',
  summary:
    'A calendar popup opened from an input or a button, or an inline Calendar: single dates, several dates or ranges, multiple months, min/max and disabled dates, first day of week, Intl formatting and locales, placement and dark appearance.',
  importLine: "import { DatePicker, Calendar } from 'onesmallui';",
  examples: [
    { name: 'datepicker-basic', title: 'Input or button trigger, ranges and formatting', description: 'The button trigger opens above with the dark appearance.' },
    { name: 'datepicker-inline', title: 'Inline calendar with multiple dates', description: 'isDateDisabled blocks weekends.' },
  ],
  props: [
    {
      title: 'Calendar',
      props: [
        { name: 'mode', type: "'single' | 'multiple' | 'range'", default: "'single'", description: 'Selection mode.' },
        { name: 'value / defaultValue', type: 'Date | null · Date[] · { start, end }', description: 'Selection, by mode.' },
        { name: 'onValueChange', type: '(value) => void', description: 'Called on selection.' },
        { name: 'min / max', type: 'Date', description: 'Selectable bounds.' },
        { name: 'isDateDisabled', type: '(date) => boolean', description: 'Disable specific dates.' },
        { name: 'months', type: 'number', default: '1', description: 'Months shown side by side.' },
        { name: 'firstDayOfWeek', type: '0–6', default: 'from locale', description: '0 = Sunday.' },
        { name: 'locale', type: 'string', default: 'browser', description: 'Month and day names via Intl.' },
        { name: 'month / defaultMonth / onMonthChange', type: 'Date', description: 'Visible month.' },
        { name: 'color', type: status, default: "'primary'", description: 'Selection color.' },
        { name: 'labels', type: '{ previous?, next? }', description: 'Month button names.' },
      ],
    },
    {
      title: 'DatePicker (also takes the Calendar props above)',
      props: [
        { name: 'trigger', type: "'input' | 'button'", default: "'input'", description: 'Typed input with a calendar button, or one button.' },
        { name: 'format', type: 'Intl.DateTimeFormatOptions | (date) => string', default: "{ dateStyle: 'medium' }", description: 'Display format.' },
        { name: 'parse', type: '(text) => Date | null', description: 'Parses typed text (single mode). Default: yyyy-mm-dd or Date.parse.' },
        { name: 'name', type: 'string', description: 'Submits yyyy-mm-dd hidden inputs.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'bottom-start'", description: 'Popup placement.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Popup look.' },
        { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Close after a date or a full range.' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'Popup state.' },
        { name: 'size / disabled / required / invalid / placeholder / dialogLabel', type: '…', description: 'Look, states and texts.' },
      ],
    },
  ],
  a11y: [
    'Follows the WAI-ARIA date picker dialog pattern: the calendar button (aria-haspopup="dialog", aria-expanded) opens a modal dialog, focus moves to the selected date or today, Tab is kept inside, Escape closes and returns focus.',
    'The month is a grid: arrows move by day and week, Home/End to the start/end of the week, Page Up/Down by month, Shift+Page Up/Down by year, Enter or Space selects. Only one day is in the tab order.',
    'Each day button is named with the full date ("Friday, October 9, 2026"); today has aria-current="date", selected days aria-selected; disabled days stay focusable with aria-disabled.',
    'The month heading is a polite live region, so paging announces the new month. Weekday headers carry the full day name in abbr.',
    'Day targets are 44 × 44px. Selection uses a filled circle with 7:1 text, not color alone.',
  ],
  classes: `.os-datepicker[data-trigger][data-state] > .os-datepicker__anchor > (.os-input .os-datepicker__toggle | .os-datepicker__button > .os-datepicker__value)
.os-datepicker__popup.os-floating[role=dialog][data-os-theme][data-appearance]
.os-calendar[data-color][data-mode] > .os-calendar__nav + .os-calendar__months > .os-calendar__month > .os-calendar__heading + .os-calendar__grid .os-calendar__cell[data-in-range][data-range-start][data-range-end] > .os-calendar__day[data-selected][data-today]`,
};

export default doc;

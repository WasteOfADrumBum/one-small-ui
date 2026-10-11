import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'range',
  order: 53,
  name: 'Range',
  group: 'Forms',
  summary:
    'A slider on top of native <input type="range">: filled track, min/max labels, steps, a value bubble, tick marks with labels, theme colors and sizes.',
  importLine: "import { Range } from 'onesmallui';",
  examples: [
    { name: 'range-basic', title: 'Filled track, value bubble and min/max', description: 'formatValue formats the bubble, the min/max labels and aria-valuetext.' },
    { name: 'range-ticks', title: 'Steps and tick marks', description: 'ticks={true} marks every step; an array places labelled ticks. Ticks also render a <datalist>.' },
    { name: 'range-colors', title: 'Colors, sizes and disabled' },
  ],
  props: [
    {
      title: 'Range',
      props: [
        { name: 'value / defaultValue', type: 'number', default: 'midpoint', description: 'Current value (controlled or not).' },
        { name: 'onValueChange', type: '(value: number) => void', description: 'Called as the thumb moves.' },
        { name: 'min / max / step', type: 'number', default: '0 / 100 / 1', description: 'Native range attributes.' },
        { name: 'showValue', type: 'boolean', description: 'Value bubble (<output>) above the thumb.' },
        { name: 'showMinMax', type: 'boolean', description: 'Min and max under the track.' },
        { name: 'ticks', type: 'boolean | number[] | { value, label? }[]', description: 'Tick marks, optionally labelled.' },
        { name: 'formatValue', type: '(value: number) => string', description: 'Formats displayed values and aria-valuetext.' },
        { name: 'color', type: status, default: "'primary'", description: 'Fill and thumb color.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track and thumb size.' },
        { name: 'invalid', type: 'boolean', description: 'Error style.' },
      ],
    },
  ],
  a11y: [
    'It is a native slider: arrow keys step, Page Up/Down jump, Home/End go to the ends, and screen readers announce the value.',
    'formatValue also sets aria-valuetext, so "21 °C" is read instead of "21".',
    'The thumb has a 3:1 border on every theme color and a 3px focus ring; the input is 44px tall.',
    'The bubble and tick labels repeat the value visually and are hidden from screen readers to avoid double announcements.',
    'The fill direction follows the text direction (RTL).',
  ],
  classes: `.os-range[data-color][data-size][data-show-value][data-disabled] (style: --_pct, --_ratio)
  > .os-range__track-wrap > .os-range__input + .os-range__bubble
  > .os-range__ticks > .os-range__tick[data-active] > .os-range__tick-label
  > .os-range__minmax`,
};

export default doc;

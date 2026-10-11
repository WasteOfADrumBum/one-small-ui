import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'progress',
  order: 120,
  name: 'Progress',
  group: 'Feedback',
  summary:
    'Linear progress with an accessible name and value. Any width and height, labels beside or inside the bar, eight theme colors, striped and animated stripes, and stacked multi-segment bars.',
  importLine: "import { Progress, ProgressStack } from 'onesmallui';",
  examples: [
    { name: 'progress-basic', title: 'Values, sizes, width, height and colors' },
    { name: 'progress-labels', title: 'Labels inside the bar, stripes and animation', description: 'Animated stripes stop under reduced motion.' },
    { name: 'progress-stack', title: 'Stacked bars', description: 'Each segment is its own labelled progressbar inside a named group.' },
  ],
  props: [
    {
      title: 'Progress',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Required accessible name.' },
        { name: 'value', type: 'number', description: 'Omit for indeterminate.' },
        { name: 'max', type: 'number', default: '100', description: 'Maximum.' },
        { name: 'hideLabel', type: 'boolean', description: 'Visually hide the label (still announced).' },
        { name: 'showValue', type: "boolean | 'inside'", description: 'Show the value beside the label, or inside the bar.' },
        { name: 'formatValue', type: '(value, max) => string', description: 'Visible value and aria-valuetext.' },
        { name: 'color', type: status, default: "'primary'", description: 'Bar color.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track height.' },
        { name: 'height', type: 'number | string', description: 'Custom track height (overrides size).' },
        { name: 'striped / animated', type: 'boolean', description: 'Diagonal stripes; animated moves them.' },
      ],
    },
    {
      title: 'ProgressStack',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Name of the whole group.' },
        { name: 'segments', type: '{ value, label, color?, striped?, animated?, showValue? }[]', description: 'One progressbar each.' },
        { name: 'max', type: 'number', default: '100', description: 'Total of the track.' },
        { name: 'legend', type: 'boolean', description: 'Show a legend with labels and values.' },
        { name: 'size / height / hideLabel / formatValue', type: '—', description: 'As for Progress.' },
      ],
    },
  ],
  a11y: [
    'role="progressbar" with aria-valuenow, aria-valuemin and aria-valuemax; formatValue also sets aria-valuetext.',
    'Values inside the bar use on-<color> on a solid fill (7:1) and are aria-hidden, since the progressbar already exposes the value.',
    'Stacked bars are a named group of separately labelled progressbars, so each segment is announced on its own.',
    'Stripe animation stops with prefers-reduced-motion or data-os-motion="off".',
  ],
  classes:
    '.os-progress[data-color][data-size][data-inside] > .os-progress__meta + .os-progress__track > .os-progress__bar[data-striped][data-animated] > .os-progress__value\n.os-progress-stack  .os-progress__legend  (--os-progress-height)',
};

export default doc;

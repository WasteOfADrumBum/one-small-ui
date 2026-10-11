import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'stepper',
  order: 75,
  name: 'Stepper',
  group: 'Navigation',
  summary:
    'Step-by-step indicators for wizards, checkouts and timelines. Horizontal, vertical or responsive; filled, outline and dot styles; adjustable gap and alignment; linked steps; rich step content; and sideways scrolling when steps overflow.',
  importLine: "import { Stepper, Step } from 'onesmallui';",
  examples: [
    { name: 'stepper-basic', title: 'Styles, colors, status and alignment' },
    {
      name: 'stepper-wizard',
      title: 'Wizard with linked steps',
      description: 'Pass `onClick` (or `href`) to make steps navigable. Orientation is responsive: vertical on small screens, horizontal from `md`.',
    },
    { name: 'stepper-timeline', title: 'Vertical timeline with complex content' },
    { name: 'stepper-overflow', title: 'Overflow', description: 'Horizontal steppers scroll sideways when the steps do not fit.' },
  ],
  props: [
    {
      title: 'Stepper',
      props: [
        { name: 'activeStep', type: 'number', default: '0', description: 'Index of the current step; earlier steps are complete.' },
        { name: 'orientation', type: "ResponsiveValue<'horizontal' | 'vertical'>", default: "'horizontal'", description: "Direction, or per breakpoint: { base: 'vertical', md: 'horizontal' }." },
        { name: 'variant', type: "'filled' | 'outline' | 'dot'", default: "'filled'", description: 'Indicator style.' },
        { name: 'align', type: "'center' | 'start'", default: "'center'", description: 'Horizontal: labels under or beside the indicator.' },
        { name: 'color', type: status, default: "'primary'", description: 'Color of complete and current steps.' },
        { name: 'gap', type: 'string', description: 'Space between steps (sets --os-stepper-gap).' },
        { name: 'onStepClick', type: '(index: number) => void', description: 'Makes every step a button.' },
        { name: 'statusLabels', type: '{ complete?, error? }', default: "{ complete: 'completed', error: 'error' }", description: 'Screen reader status text, for translation.' },
        { name: 'aria-label', type: 'string', default: "'Progress'", description: 'Names the list of steps.' },
      ],
    },
    {
      title: 'Step',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Required step name.' },
        { name: 'description', type: 'ReactNode', description: 'Secondary line.' },
        { name: 'status', type: "'complete' | 'current' | 'upcoming' | 'error'", description: 'Overrides the status from activeStep.' },
        { name: 'icon', type: 'ReactNode', description: 'Replaces the number or check mark.' },
        { name: 'href / onClick', type: 'string / MouseEventHandler', description: 'Makes the step a link or button.' },
        { name: 'disabled', type: 'boolean', description: 'For linked steps that cannot be visited yet.' },
        { name: 'children', type: 'ReactNode', description: 'Extra content under the title.' },
      ],
    },
  ],
  a11y: [
    'Rendered as an ordered list, so screen readers announce "list, 4 items" and each position.',
    'The current step has aria-current="step"; completed and failed steps add visually hidden ", completed" / ", error" to their name, so status is not shown by color alone.',
    'Linked steps are real buttons or links, at least 44px tall, with visible focus. Disable steps that cannot be visited yet.',
    'When a horizontal stepper overflows it becomes a focusable, named scroll region, so keyboard users can scroll it.',
  ],
  classes:
    '.os-stepper[data-orientation][data-variant][data-align][data-color] > .os-stepper__list > .os-stepper__step[data-status][data-last][data-interactive] > .os-stepper__trigger > .os-stepper__indicator + .os-stepper__text > .os-stepper__title + .os-stepper__description\n.os-stepper__content  (--os-stepper-gap, --os-stepper-step-min)',
};

export default doc;

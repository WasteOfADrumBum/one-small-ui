import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'popover',
  order: 90,
  name: 'Popover',
  group: 'Overlays',
  summary:
    'Contextual overlays with a title and body, anchored to a trigger. Click, hover or focus triggers, responsive placement with flipping, an arrow, light dismiss and custom styling. A non-modal dialog in the top layer.',
  importLine: "import { Popover } from 'onesmallui';",
  examples: [
    { name: 'popover-basic', title: 'Placements', description: 'Responsive placement takes a value per breakpoint.' },
    { name: 'popover-triggers', title: 'Triggers, dismiss on next click, disabled controls' },
    { name: 'popover-custom', title: 'Appearance and custom styling' },
  ],
  props: [
    {
      title: 'Popover',
      props: [
        { name: 'title', type: 'ReactNode', description: 'Heading; names the dialog.' },
        { name: 'content', type: 'ReactNode', description: 'Body.' },
        { name: 'children', type: 'ReactElement', description: 'The trigger: one focusable element.' },
        { name: 'trigger', type: "'click' | 'hover' | 'focus' | array", default: "'click'", description: "'focus' dismisses on the next click; 'hover' also opens on focus." },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'top'", description: 'Preferred side; flips when there is no room.' },
        { name: 'offset', type: 'number', default: '10', description: 'Gap from the trigger in px.' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled.' },
        { name: 'arrow', type: 'boolean', default: 'true', description: 'Pointer arrow.' },
        { name: 'closeButton', type: 'boolean', default: "trigger includes 'click'", description: 'Show a × button.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Panel style.' },
        { name: 'className / style', type: 'string / CSSProperties', description: 'Applied to the floating panel.' },
        { name: 'aria-label', type: 'string', description: 'Accessible name when there is no title.' },
      ],
    },
  ],
  a11y: [
    'The panel is a non-modal role="dialog" labelled by its title; it follows the trigger in the DOM, so Tab moves into it.',
    'Click triggers get aria-haspopup="dialog", aria-expanded and aria-controls. Hover/focus popovers describe the trigger (aria-describedby) instead.',
    'Escape closes it and returns focus to the trigger if focus was inside. Clicking outside closes it.',
    'Disabled buttons do not fire events: wrap them in <span tabIndex={0}> so keyboard and pointer users still get the explanation.',
    'Hover popovers stay open while the pointer is over them (WCAG 1.4.13).',
  ],
  classes: `.os-floating.os-popover[role=dialog][data-side][data-placement][data-arrow]
  > .os-floating__arrow
  > .os-popover__header > .os-popover__title
  > .os-popover__body`,
};

export default doc;

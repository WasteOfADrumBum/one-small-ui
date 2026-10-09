import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tooltip',
  order: 100,
  name: 'Tooltip',
  group: 'Overlays',
  summary:
    'Short descriptions on hover and focus, positioned in the top layer with flipping and responsive placement. Rich content, custom styling, interactive tooltips, disabled-control wrappers and delegated tooltips via data attributes.',
  importLine: "import { Tooltip, TooltipProvider } from 'onesmallui';",
  examples: [
    { name: 'tooltip-basic', title: 'Placements' },
    { name: 'tooltip-rich', title: 'Rich content, styling and disabled controls' },
    { name: 'tooltip-interactive', title: 'Interactive tooltips and delegation', description: 'TooltipProvider gives every [data-os-tooltip] descendant a tooltip.' },
  ],
  props: [
    {
      title: 'Tooltip',
      props: [
        { name: 'content', type: 'ReactNode', description: 'Text or rich content.' },
        { name: 'children', type: 'ReactElement', description: 'One focusable trigger. Wrap disabled controls in <span tabIndex={0}>.' },
        { name: 'placement', type: 'ResponsiveValue<Placement>', default: "'top'", description: 'Side and alignment, optionally per breakpoint. Flips when there is no room.' },
        { name: 'delay', type: 'number', default: '300', description: 'Hover delay in ms (focus is instant).' },
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', description: 'Controlled or uncontrolled.' },
        { name: 'interactive', type: 'boolean', description: 'Content may hold links; stays open while focus is inside.' },
        { name: 'arrow', type: 'boolean', default: 'true', description: 'Pointer arrow.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'default is inverted high-contrast.' },
        { name: 'className / contentClassName', type: 'string', description: 'Wrapper / floating tooltip classes.' },
      ],
    },
    {
      title: 'TooltipProvider',
      props: [
        { name: 'placement / delay / appearance', type: 'as Tooltip', description: 'Defaults for every delegated tooltip.' },
        { name: 'data-os-tooltip', type: 'string (attribute)', description: 'Tooltip text on any descendant.' },
        { name: 'data-os-tooltip-placement', type: 'Placement (attribute)', description: 'Per-element side.' },
      ],
    },
  ],
  a11y: [
    'Linked to its trigger with aria-describedby; delegated tooltips add and remove it as they show.',
    'WCAG 1.4.13: hoverable (moving onto the tooltip keeps it open), persistent, and dismissible with Escape.',
    'Opens immediately on keyboard focus; hover uses a short delay.',
    'Never put essential information in a tooltip. Interactive tooltips drop role="tooltip" and stay open while focused, but a Popover is the better choice for links and buttons.',
    'Icon-only triggers still need their own aria-label; the tooltip is a description, not a name.',
  ],
  classes: `.os-tooltip[data-state] > trigger + .os-floating.os-tooltip__content[role=tooltip][data-state][data-side][data-tone][data-interactive]
  > .os-floating__arrow
.os-tooltip-provider [data-os-tooltip]`,
};

export default doc;

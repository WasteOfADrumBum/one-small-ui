import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'collapse',
  order: 95,
  name: 'Collapse',
  group: 'Navigation',
  summary:
    'Shows and hides content with a smooth height (or width) animation and no measuring. Toggle it with a CollapseTrigger, or from code with `open`.',
  importLine: "import { Collapsible, CollapseTrigger, Collapse, useCollapsible } from 'onesmallui';",
  examples: [
    { name: 'collapse-basic', title: 'Trigger and panel' },
    {
      name: 'collapse-controlled',
      title: 'Controlled from code',
      description: 'Pass `open` (here from `useDisclosure`) and wire your own button with `aria-expanded` and `aria-controls`.',
    },
    { name: 'collapse-horizontal', title: 'Horizontal' },
    { name: 'collapse-multiple', title: 'One trigger, several panels' },
  ],
  props: [
    {
      title: 'Collapsible',
      props: [
        { name: 'open / defaultOpen', type: 'boolean', default: 'false', description: 'Shared state for its triggers and panels.' },
        { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when a trigger toggles.' },
      ],
    },
    {
      title: 'CollapseTrigger',
      props: [
        { name: '…Button props', type: 'ButtonProps', description: 'Renders a Button with aria-expanded and aria-controls set.' },
        { name: 'controls', type: 'string', description: 'Override the controlled panel ids.' },
      ],
    },
    {
      title: 'Collapse',
      props: [
        { name: 'open', type: 'boolean', description: 'Controlled state when used outside a Collapsible.' },
        { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Animate height or width.' },
        { name: 'id', type: 'string', description: 'Panel id (generated if omitted).' },
      ],
    },
    {
      title: 'useCollapsible()',
      props: [{ name: 'returns', type: '{ isOpen, setOpen, toggle, triggerProps }', description: 'Build a custom trigger inside a Collapsible.' }],
    },
  ],
  a11y: [
    'The trigger is a button with aria-expanded and aria-controls pointing at every panel it controls.',
    'Closed panels are inert and visibility: hidden, so they are skipped by Tab, screen readers and find-in-page.',
    'The animation collapses to nothing under reduced motion.',
    'Use Accordion instead when the trigger is a section heading.',
  ],
  classes: '.os-collapse[data-state][data-orientation] > .os-collapse__inner',
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'accordion',
  order: 90,
  name: 'Accordion',
  group: 'Navigation',
  summary:
    'Collapsible sections with a smooth height animation and no measuring. Default, flush and spaced variants, two sizes, single or multiple open, a native <details> mode, nesting and custom indicators.',
  importLine: "import { Accordion, AccordionItem } from 'onesmallui';",
  examples: [
    { name: 'accordion-basic', title: 'Single open item' },
    { name: 'accordion-variants', title: 'Variants and sizes', description: 'Default (one bordered box), flush (edge to edge, for cards and sidebars) and spaced (separate cards).' },
    {
      name: 'accordion-expand-all',
      title: 'Multiple open, expand and collapse all',
      description: 'Control `value` with `type="multiple"` and set it to every item, or to none.',
    },
    { name: 'accordion-native', title: 'Native details / summary', description: 'Works without JavaScript; `type="single"` uses the exclusive `name` attribute.' },
    { name: 'accordion-nested', title: 'Nested accordions and custom indicators' },
  ],
  props: [
    {
      title: 'Accordion',
      props: [
        { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'How many items may be open.' },
        { name: 'value / defaultValue', type: 'string[]', description: 'Open items, controlled or initial.' },
        { name: 'onValueChange', type: '(value: string[]) => void', description: 'Called with the open items.' },
        { name: 'variant', type: "'default' | 'flush' | 'spaced'", default: "'default'", description: 'Outer treatment.' },
        { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Trigger height and text size (sm stays 44px tall).' },
        { name: 'native', type: 'boolean', default: 'false', description: 'Render items as <details>/<summary>.' },
        { name: 'indicator', type: 'ReactNode | (open: boolean) => ReactNode', description: 'Replace the chevron. Nodes rotate when open; functions do not.' },
        { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'Heading wrapping each trigger.' },
      ],
    },
    {
      title: 'AccordionItem',
      props: [
        { name: 'value', type: 'string', description: 'Required. Identifies the item.' },
        { name: 'title', type: 'ReactNode', description: 'Trigger text.' },
        { name: 'disabled', type: 'boolean', description: 'Cannot be toggled.' },
        { name: 'indicator', type: 'ReactNode | (open: boolean) => ReactNode', description: 'Per-item indicator.' },
      ],
    },
  ],
  a11y: [
    'Each trigger is a button inside a heading with aria-expanded and aria-controls; the panel is a region labelled by its trigger.',
    'Collapsed content is inert, so it is skipped by Tab and screen readers.',
    'For nested accordions, lower headingLevel by one so the page outline stays correct.',
    'Native mode exposes each <summary> as a disclosure button with its expanded state; it has no heading, so prefer the default mode for long documents navigated by heading.',
    'Expand all / collapse all are ordinary buttons placed before the accordion. They stay enabled, so focus is never lost when one is pressed.',
  ],
  classes:
    '.os-accordion[data-variant][data-size][data-native] > .os-accordion__item[data-state] > .os-accordion__heading > .os-accordion__trigger > .os-accordion__chevron[data-static]\n.os-accordion__region > .os-accordion__content > .os-accordion__inner',
};

export default doc;

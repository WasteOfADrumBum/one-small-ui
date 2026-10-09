import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'accordion',
  order: 90,
  name: 'Accordion',
  group: 'Navigation',
  summary: 'Expandable sections with a smooth height animation and no measuring.',
  importLine: "import { Accordion, AccordionItem } from 'onesmallui';",
  examples: [{ name: 'accordion-basic', title: 'Single open item' }],
  props: [
    {
      title: 'Accordion',
      props: [
        { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'How many items may be open.' },
        { name: 'defaultValue / value', type: 'string[]', description: 'Open items.' },
        { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'Heading wrapping each trigger.' },
      ],
    },
  ],
  a11y: [
    'Each trigger is a button inside a heading with aria-expanded and aria-controls.',
    'Collapsed content is inert, so it is skipped by Tab and screen readers.',
  ],
  classes: '.os-accordion > .os-accordion__item[data-state]',
};

export default doc;

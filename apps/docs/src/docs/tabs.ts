import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tabs',
  order: 80,
  name: 'Tabs',
  group: 'Navigation',
  summary: 'Switch between views with a sliding, glowing indicator. Line and pill styles, horizontal or vertical.',
  importLine: "import { Tabs, TabList, Tab, TabPanel } from 'onesmallui';",
  examples: [{ name: 'tabs-basic', title: 'Line and pill tabs' }],
  props: [
    {
      title: 'Tabs',
      props: [
        { name: 'defaultValue', type: 'string', description: 'Initially selected tab.' },
        { name: 'value / onValueChange', type: 'string / (v) => void', description: 'Controlled mode.' },
        { name: 'variant', type: "'line' | 'pill'", default: "'line'", description: 'Indicator style.' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical from md up.' },
      ],
    },
    {
      title: 'TabPanel',
      props: [{ name: 'keepMounted', type: 'boolean', description: 'Keep hidden panels mounted to preserve state.' }],
    },
  ],
  a11y: [
    'Implements the WAI-ARIA tabs pattern with roving tabindex.',
    'Arrow keys, Home and End move between tabs; Tab moves into the panel.',
    'Give TabList an aria-label.',
  ],
  classes: '.os-tabs[data-variant] > .os-tabs__list > .os-tabs__tab',
};

export default doc;

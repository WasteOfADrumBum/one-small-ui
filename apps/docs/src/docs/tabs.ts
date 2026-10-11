import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tabs',
  order: 80,
  name: 'Tabs',
  group: 'Navigation',
  summary:
    'Switchable content panels following the WAI-ARIA tabs pattern. Line, pill, underline, list-group and button triggers, your own Button as a tab, optional fade, and automatic or manual activation.',
  importLine: "import { Tabs, TabList, Tab, TabPanel } from 'onesmallui';",
  examples: [
    { name: 'tabs-basic', title: 'Line and pill tabs' },
    { name: 'tabs-variants', title: 'Underline, list group and button triggers', description: 'Manual activation and fade={false} shown too.' },
  ],
  props: [
    {
      title: 'Tabs',
      props: [
        { name: 'defaultValue', type: 'string', description: 'Initially selected tab.' },
        { name: 'value / onValueChange', type: 'string / (v) => void', description: 'Controlled mode.' },
        { name: 'variant', type: "'line' | 'pill' | 'underline' | 'list' | 'button'", default: "'line'", description: 'Trigger style.' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical from md up.' },
        { name: 'activation', type: "'automatic' | 'manual'", default: "'automatic'", description: 'Arrow keys select (automatic) or only move focus (manual: Enter/Space selects).' },
        { name: 'fade', type: 'boolean', default: 'true', description: 'Fade panels in when they change.' },
      ],
    },
    {
      title: 'Tab',
      props: [
        { name: 'value', type: 'string', description: 'Matches a TabPanel.' },
        { name: 'disabled / icon', type: 'boolean / ReactNode', description: 'Disabled tabs are skipped by arrow keys.' },
        { name: 'asChild', type: 'boolean', description: 'Render the child element (e.g. a Button) as the tab.' },
      ],
    },
    {
      title: 'TabPanel',
      props: [{ name: 'keepMounted', type: 'boolean', description: 'Keep hidden panels mounted to preserve state.' }],
    },
  ],
  a11y: [
    'Implements the WAI-ARIA tabs pattern with roving tabindex.',
    'Arrow keys, Home and End move between tabs; Tab moves into the panel. Use manual activation when panels are slow to render.',
    'Give TabList an aria-label. With asChild the child receives role="tab", aria-selected and aria-controls.',
  ],
  classes: '.os-tabs[data-variant][data-orientation][data-fade] > .os-tabs__list > .os-tabs__tab[aria-selected] + .os-tabs__indicator',
};

export default doc;

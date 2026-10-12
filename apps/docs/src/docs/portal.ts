import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'portal',
  order: 70,
  name: 'Portal',
  group: 'Accessibility',
  summary:
    'Renders its children somewhere else in the DOM, <body> by default, while keeping React context and events. Use it for banners and custom overlays that must escape a parent with overflow: hidden or a stacking context.',
  importLine: "import { Portal } from '@onesmall/ui';",
  examples: [
    { name: 'portal-basic', title: 'Rendering into <body>' },
    { name: 'portal-container', title: 'Rendering into a chosen element' },
  ],
  props: [
    {
      title: 'Portal',
      props: [
        { name: 'children', type: 'ReactNode', description: 'What to render.' },
        { name: 'container', type: 'Element | DocumentFragment | null', default: 'document.body', description: 'Where to render.' },
      ],
    },
  ],
  keyboard: [
    {
      keys: 'None',
      action: 'Adds no keys of its own. Tab follows the DOM, so portaled content comes last in the tab order. Move focus into it on open and back on close.',
    },
  ],
  screenReader: [
    'Screen readers also follow the DOM: portaled content is read at the end of the page, away from the button that opened it. Move focus to it, or announce it.',
    'Content rendered straight into <body> sits outside your landmarks. Give it a landmark role and a name (role="region" with aria-label), or make it a dialog.',
    'React events still bubble through the React tree, not the DOM tree.',
  ],
  dos: [
    'Pair it with focus management: autoFocus inside, and focus the opener again on close.',
    'Pass a container when the content belongs to a specific part of the page.',
  ],
  donts: [
    "Don't portal content that should be read in place, such as inline help or form errors.",
    "Don't wrap Dialog, Drawer, Tooltip or Popover in a Portal; they already render where they need to.",
  ],
  a11y: [
    'Renders nothing on the server and during hydration, so it is SSR safe with no mismatch warnings.',
  ],
};

export default doc;

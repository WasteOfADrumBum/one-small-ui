import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'javascript',
  order: 45,
  name: 'JavaScript (no React)',
  group: 'Framework',
  summary:
    'onesmallui/dom wires interactive components on plain HTML through data-os-* attributes, with methods and cancelable events. It uses the same os- classes as the React components, ships as ES modules with TypeScript declarations, and has a single-file script for CDNs.',
  importLine: "import { init } from 'onesmallui/dom';",
  examples: [{ name: 'dom-basic', title: 'Collapse, tooltip and dismiss from markup' }],
  reference: [
    {
      title: 'Data attributes',
      columns: ['Attribute', 'Does'],
      rows: [
        ['data-os-toggle="collapse|dialog|drawer|menu|popover|tab"', 'Opens, closes or activates the target. Sets aria-expanded and aria-controls on the trigger.'],
        ['data-os-toggle="class|attr"', 'Toggles data-os-class or data-os-attr / data-os-value on the target; sets aria-pressed.'],
        ['data-os-target="#id"', 'The element a trigger controls (href="#id" and aria-controls also work).'],
        ['data-os-dismiss="alert|toast|dialog|drawer|popover"', 'Closes the nearest matching component.'],
        ['data-os-tooltip="Text"', 'Shows a tooltip on hover and focus.'],
        ['data-os-placement, data-os-offset', 'Floating placement (top, bottom-start, …) and offset in px.'],
        ['data-os-spy', 'On a nav: marks the link of the section in view (aria-current).'],
        ['data-os-slide="prev|next|<index>"', 'Moves the nearest .os-carousel.'],
        ['data-os-modal="false"', 'Opens a dialog non-modally.'],
      ],
    },
    {
      title: 'Methods',
      columns: ['Call', 'Does'],
      rows: [
        ['init(root?)', 'Starts delegated listeners once; safe to call again for new content.'],
        ['destroy()', 'Removes the listeners.'],
        ['Collapse.getOrCreate(el).show() / hide() / toggle()', 'Controls a .os-collapse.'],
        ['Overlay.getOrCreate(dialog).show() / hide()', 'Controls a .os-dialog or .os-drawer.'],
        ['Floating.getOrCreate(el).show(trigger) / hide()', 'Controls a menu or popover.'],
        ['activateTab(tab), slide(carousel, to), scrollSpy(nav)', 'Tabs, carousels and scrollspy.'],
        ['toast({ title, description, color })', 'Adds a toast to the viewport.'],
        ['dismiss(el)', 'Closes any dismissible component.'],
      ],
    },
    {
      title: 'Events (bubble, listen on document)',
      columns: ['Event', 'When'],
      rows: [
        ['os:show / os:hide', 'Before opening or closing. Call preventDefault() to stop it.'],
        ['os:shown / os:hidden', 'After the transition ends.'],
        ['os:activate', 'A tab was activated.'],
        ['os:slide / os:slid', 'A carousel is moving / moved.'],
      ],
    },
  ],
  snippets: [
    {
      title: 'Script tag (auto-initialises, global OneSmallUI)',
      language: 'markup',
      code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/onesmallui@0.2.0/dist/onesmallui.min.css">
<script src="https://cdn.jsdelivr.net/npm/onesmallui@0.2.0/dist/onesmallui-dom.iife.js" defer></script>

<button class="os-btn" data-variant="solid" data-color="primary" data-size="md"
        data-os-toggle="dialog" data-os-target="#hello">Open</button>
<dialog class="os-dialog" id="hello" aria-labelledby="hello-title">
  <div class="os-dialog__panel">
    <h2 id="hello-title">Hello</h2>
    <button class="os-btn" data-variant="soft" data-color="neutral" data-size="md" data-os-dismiss="dialog">Close</button>
  </div>
</dialog>`,
    },
    {
      title: 'Methods and events',
      language: 'ts',
      code: `import { init, Collapse } from 'onesmallui/dom';

init();
document.addEventListener('os:hide', (e) => {
  if (!confirm('Close it?')) e.preventDefault();
});
Collapse.getOrCreate(document.querySelector('#filters')!).toggle();`,
    },
  ],
  a11y: [
    'Triggers get aria-controls, aria-expanded and aria-haspopup automatically.',
    'Escape closes the open overlay and returns focus to its trigger; menus get arrow keys, Home and End.',
    'Collapsed regions are inert so their content leaves the tab order.',
  ],
};

export default doc;

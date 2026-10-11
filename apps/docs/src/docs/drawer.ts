import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'drawer',
  order: 75,
  name: 'Drawer',
  group: 'Overlays',
  summary:
    'Side panels and sheets that slide in from any edge, on the native <dialog> element. Header, body and footer parts, responsive inline mode, sheet presentation, optional body scrolling and static backdrops. Replaces offcanvas.',
  importLine: "import { Drawer } from 'onesmallui';",
  examples: [
    { name: 'drawer-placements', title: 'Placements', description: 'start and end follow the text direction; left and right are kept as physical aliases.' },
    { name: 'drawer-options', title: 'Sheet, body scrolling, backdrop, instant and appearance' },
    { name: 'drawer-responsive', title: 'Responsive drawer', description: 'inlineFrom renders the content inline from a breakpoint up, and as a drawer below it.' },
  ],
  props: [
    {
      title: 'Drawer',
      props: [
        { name: 'open', type: 'boolean', description: 'Controls visibility.' },
        { name: 'onClose', type: '() => void', description: 'Escape, the close button, or a backdrop click.' },
        { name: 'title', type: 'ReactNode', description: 'Header title; labels the drawer.' },
        { name: 'description', type: 'ReactNode', description: 'Header description.' },
        { name: 'footer', type: 'ReactNode', description: 'Fixed footer.' },
        { name: 'placement', type: "'start' | 'end' | 'top' | 'bottom' | 'left' | 'right'", default: "'end'", description: 'Edge it slides from.' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width (side) or max height (top/bottom).' },
        { name: 'sheet', type: 'boolean', description: 'Rounded panel inset from the screen edges.' },
        { name: 'inlineFrom', type: "'sm' | 'md' | 'lg' | 'xl' | '2xl'", description: 'Render inline (no dialog, no header) from this breakpoint up.' },
        { name: 'modal', type: 'boolean', default: 'true', description: 'false: non-modal, page stays scrollable and interactive.' },
        { name: 'backdrop', type: "boolean | 'static'", default: 'true', description: "'static' ignores backdrop clicks." },
        { name: 'scrollLock', type: 'boolean', default: 'modal', description: 'Lock page scroll while open.' },
        { name: 'instant', type: 'boolean', default: 'false', description: 'No slide animation.' },
        { name: 'appearance', type: "'default' | 'dark' | 'translucent'", default: "'default'", description: 'Panel style.' },
        { name: 'initialFocus / returnFocus', type: 'RefObject / boolean | RefObject', description: 'Focus management, as on Dialog.' },
      ],
    },
  ],
  a11y: [
    'Modal drawers trap focus with showModal() and return focus to the opener on close.',
    'Escape always closes; a static backdrop only ignores pointer clicks.',
    'Non-modal drawers (modal={false}) leave the page usable; Escape still closes them.',
    'Placements are logical: start/end and the slide direction flip in right-to-left documents.',
    'The responsive inline mode renders plain content, so it is not announced as a dialog on wide screens.',
  ],
  classes: `dialog.os-drawer[data-placement][data-size][data-sheet][data-instant][data-modal][data-backdrop][data-state]
  > .os-drawer__panel > .os-drawer__header | .os-drawer__body | .os-drawer__footer
.os-drawer[data-inline] /* responsive inline mode */`,
};

export default doc;

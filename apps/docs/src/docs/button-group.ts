import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'button-group',
  order: 20,
  name: 'Button group & toolbar',
  group: 'Actions',
  summary:
    'Join related buttons into one control, horizontally or vertically, with optional dividers. Groups pass size, variant, color and shape to every button inside, nest freely, and combine into keyboard-friendly toolbars.',
  importLine: "import { ButtonGroup, ButtonToolbar } from 'onesmallui';",
  examples: [
    { name: 'button-group', title: 'Groups', description: 'Horizontal, dividers, sizes, themes, vertical and nested.' },
    { name: 'button-toolbar', title: 'Toolbar', description: 'Tab into it once, then use arrow keys, Home and End.' },
  ],
  props: [
    {
      title: 'ButtonGroup',
      props: [
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction.' },
        { name: 'attached', type: 'boolean', default: 'true', description: 'Join buttons with shared borders, or space them apart.' },
        { name: 'dividers', type: 'boolean', description: 'Line between attached buttons.' },
        { name: 'size / variant / color / shape', type: 'Button props', description: 'Defaults for every button inside.' },
        { name: 'color', type: color, description: 'Color role default.' },
        { name: 'aria-label', type: 'string', description: 'Names the group (role="group").' },
      ],
    },
    {
      title: 'ButtonToolbar',
      props: [
        { name: 'aria-label', type: 'string', description: 'Required. Names the toolbar.' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Arrow key axis.' },
      ],
    },
  ],
  a11y: [
    'Groups use role="group"; give each an aria-label.',
    'Toolbars follow the WAI-ARIA toolbar pattern: one Tab stop with roving tabindex, arrows reversed in right-to-left layouts.',
    'Focused and hovered buttons are lifted above neighbors so the focus ring is never clipped.',
  ],
  classes: '.os-btn-group[data-orientation][data-attached][data-dividers], .os-btn-toolbar',
};

export default doc;

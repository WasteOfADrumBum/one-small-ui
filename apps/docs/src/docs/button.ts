import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'button',
  order: 10,
  name: 'Button',
  group: 'Actions',
  summary:
    'Triggers an action. Seven variants, nine colors, four sizes, three shapes, icons, active, pressed and loading states, and link mode with `href`.',
  importLine: "import { Button } from 'onesmallui';",
  examples: [
    {
      name: 'button-variants',
      title: 'Variants',
      description:
        'Solid (filled), soft (Bootstrap "subtle"), outline, ghost (Bootstrap "text"), link, glow (decorative, Bootstrap "styled") and base (an unstyled foundation for custom buttons).',
    },
    { name: 'button-colors', title: 'Colors', description: 'Every color pairing is verified at 7:1 contrast or better in both themes.' },
    { name: 'button-sizes', title: 'Sizes, icons, loading, links and full width' },
    { name: 'button-shapes-states', title: 'Shapes and states', description: 'Pill and square shapes; active, disabled and toggled (aria-pressed) states.' },
    { name: 'button-classes', title: 'Plain HTML elements', description: 'Classes and data attributes work on <button>, <a> and <input> without React.' },
  ],
  props: [
    {
      title: 'Button',
      props: [
        { name: 'variant', type: "'solid' | 'soft' | 'outline' | 'ghost' | 'link' | 'glow' | 'base'", default: "'solid'", description: 'Visual treatment.' },
        { name: 'color', type: color, default: "'primary'", description: 'Color role.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Height and type size. Smaller sizes keep a 44px hit area.' },
        { name: 'shape', type: "'default' | 'pill' | 'square'", default: "'default'", description: 'Corner style.' },
        { name: 'active', type: 'boolean', description: 'Current/pressed look. On links also sets aria-current="page".' },
        { name: 'pressed', type: 'boolean', description: 'Makes it a toggle button with aria-pressed.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner, sets aria-busy and ignores clicks.' },
        { name: 'loadingText', type: 'string', description: 'Announced to screen readers while loading.' },
        { name: 'leftIcon / rightIcon', type: 'ReactNode', description: 'Decorative icons (hidden from assistive tech).' },
        { name: 'iconOnly', type: 'boolean', description: 'Square button. Give it an aria-label.' },
        { name: 'fullWidth', type: 'boolean', description: 'Stretch to the container width.' },
        { name: 'href', type: 'string', description: 'Renders an <a> instead of a <button>.' },
      ],
    },
  ],
  a11y: [
    'Renders a native <button type="button"> (or <a> with href), so Enter and Space work out of the box.',
    'Minimum 44×44px target size (WCAG 2.5.5 AAA), including xs and sm.',
    'Focus ring: 3px outline with offset plus glow, at 3:1 or better against every surface (2.4.13).',
    'Icon-only buttons need aria-label; icons are aria-hidden.',
    'Use pressed for on/off toggles so the state is announced; active alone is visual.',
  ],
  classes: '.os-btn[data-variant][data-color][data-size][data-shape][data-active][data-icon-only][data-full-width]',
};

export default doc;

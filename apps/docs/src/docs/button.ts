import type { ComponentDoc } from '../site/docTypes';
import { color } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'button',
  order: 10,
  name: 'Button',
  group: 'Actions',
  summary: 'Triggers an action. Four variants, seven colors, three sizes, icons, loading state, and link mode with `href`.',
  importLine: "import { Button } from 'onesmallui';",
  examples: [
    { name: 'button-variants', title: 'Variants' },
    { name: 'button-colors', title: 'Colors', description: 'Every color pairing is verified at 7:1 contrast or better in both themes.' },
    { name: 'button-sizes', title: 'Sizes, icons, loading and links' },
    { name: 'button-classes', title: 'Plain HTML', description: 'Classes and data attributes work without React.' },
  ],
  props: [
    {
      title: 'Button',
      props: [
        { name: 'variant', type: "'solid' | 'soft' | 'outline' | 'ghost'", default: "'solid'", description: 'Visual weight.' },
        { name: 'color', type: color, default: "'primary'", description: 'Color role.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height and type size. Small buttons keep a 44px hit area.' },
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
    'Minimum 44×44px target size (WCAG 2.5.5 AAA), including the small size.',
    'Focus ring: 3px outline with offset plus glow, at 3:1 or better against every surface (2.4.13).',
    'Icon-only buttons need aria-label; icons are aria-hidden.',
  ],
  classes: '.os-btn[data-variant][data-color][data-size]',
};

export default doc;

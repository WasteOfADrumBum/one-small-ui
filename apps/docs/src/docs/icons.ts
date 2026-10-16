import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'icons',
  order: 60,
  name: 'Icons',
  group: 'Content',
  summary:
    '44 stroked icons on a 24×24 grid that take the text color, so they follow themes and forced colors. Decorative by default; give one a label when it carries meaning on its own. Each icon is its own module, so you ship only the ones you import.',
  importLine: "import { ChevronDownIcon, Icon, createIcon } from '@onesmall/ui/icons'; // also exported from '@onesmall/ui'",
  examples: [
    {
      name: 'icons-search',
      title: 'Find an icon',
      description: 'Filter by name, then select an icon to copy its import line.',
    },
    { name: 'icons-usage', title: 'Size, stroke and labels' },
    {
      name: 'icons-qa',
      title: 'QA grid',
      description: 'Every icon at sm, md and lg, for checking stroke weight and alignment. The lg column shows a 4px keyline grid on the 24×24 canvas.',
    },
  ],
  snippets: [
    {
      title: 'Your own icons',
      language: 'tsx',
      description:
        'createIcon builds a named component from shapes drawn on the same 24×24 grid. It takes every Icon prop and forwards its ref to the <svg>. Pass defaults as a third argument.',
      code: `import { createIcon, Icon } from '@onesmall/ui/icons';

export const RocketIcon = createIcon(
  'Rocket',
  <>
    <path d="M12 2c3 2.5 4.5 6 4.5 10l-2 4h-5l-2-4C7.5 8 9 4.5 12 2Z" />
    <path d="M9.5 16 8 21l4-2 4 2-1.5-5" />
  </>,
);

// One-off: the base Icon with children
<Icon label="Orbit"><circle cx="12" cy="12" r="9" /></Icon>`,
    },
    {
      title: 'Size tokens',
      language: 'css',
      description: 'The presets read these, so you can resize every icon at once or per section.',
      code: `:root {
  --os-icon-sm: 1rem;    /* 16px */
  --os-icon-md: 1.25rem; /* 20px, the default */
  --os-icon-lg: 1.5rem;  /* 24px */
}

.toolbar { --os-icon-md: 1.5rem; }`,
    },
  ],
  props: [
    {
      title: 'Icon and every XxxIcon',
      props: [
        { name: 'size', type: "'sm' | 'md' | 'lg' | number", default: "'md'", description: 'sm 16px, md 20px, lg 24px (from --os-icon-*), or pixels.' },
        { name: 'label', type: 'string', description: 'Accessible name. With it: role="img" and aria-label. Without it: aria-hidden="true" and focusable="false".' },
        { name: 'strokeWidth', type: 'number', default: '2', description: 'In viewBox units, on the 24×24 grid.' },
        { name: 'children (Icon only)', type: 'ReactNode', description: 'Shapes to draw.' },
        { name: '…SVG props', type: 'SVGProps<SVGSVGElement>', description: 'className, style, data-*, and a ref to the <svg>.' },
      ],
    },
    {
      title: 'createIcon(name, shapes, defaults?)',
      props: [
        { name: 'name', type: 'string', description: "Display name without the suffix: 'Rocket' gives RocketIcon." },
        { name: 'shapes', type: 'ReactNode', description: 'Paths drawn on a 24×24 grid.' },
        { name: 'defaults', type: 'IconProps & data-*', description: "Props the icon renders with unless overridden, e.g. { 'data-spin': '' }." },
        { name: 'returns', type: 'IconComponent', description: 'A forwardRef component.' },
      ],
    },
  ],
  keyboard: [{ keys: 'None', action: 'Icons are never focusable. Put interactive behavior on the surrounding button or link.' }],
  screenReader: [
    'Without label, icons are hidden (aria-hidden="true", focusable="false"), so "Download report" reads as just that.',
    'With label, the icon is read as an image with that name. Use it when the icon is the only thing saying something, like a status icon beside a number.',
    'For icon-only buttons, name the button (aria-label="Settings") and leave the icon unlabelled, so the name is not read twice.',
  ],
  dos: [
    'Pair icons with visible text wherever space allows.',
    'Give icon-only buttons an aria-label and a 44×44px target (Button iconOnly does this).',
    'Use the same icon for the same action everywhere.',
  ],
  donts: [
    "Don't label an icon that sits next to text saying the same thing.",
    "Don't use color alone to tell icons apart; pick a different shape too.",
    "Don't set fill or stroke colors directly; set color on a parent so themes and forced colors still work.",
  ],
  a11y: [
    'Icons use currentColor, so they meet the same contrast as the text around them and switch to system colors in forced-colors mode.',
    'LoaderIcon spins only when motion is allowed; it stops under reduced motion.',
  ],
  classes: 'svg.os-icon[data-size="sm" | "md" | "lg"][data-spin]',
};

export default doc;

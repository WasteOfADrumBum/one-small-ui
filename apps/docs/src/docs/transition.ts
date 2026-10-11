import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'transition',
  order: 42,
  name: 'Transition',
  group: 'Framework',
  summary:
    'Animates one element in and out with a preset or your own classes. It drives the same data-state as every overlay, uses the motion tokens, and goes instant under reduced motion while still firing its callbacks. useTransition is the hook behind it.',
  importLine: "import { Transition, useTransition, transitionPresets, motion } from '@onesmall/ui';",
  examples: [
    { name: 'transition-presets', title: 'Presets', description: 'Pick a preset, then hide and show the card.' },
    {
      name: 'transition-collapse',
      title: 'Collapse',
      description: "enter=\"collapse\" measures the content and animates its height. Use it for one-off reveals; Collapse adds triggers and inert handling.",
    },
  ],
  reference: [
    {
      title: 'data-state',
      columns: ['Value', 'Meaning'],
      rows: [
        ['opening', 'Animating in. onEnter has fired.'],
        ['open', 'Fully shown. onEntered has fired.'],
        ['closing', 'Animating out. onExit has fired.'],
        ['closed', 'Fully hidden (hidden attribute, or unmounted with unmountOnExit). onExited has fired.'],
      ],
    },
    {
      title: 'Who uses data-state',
      columns: ['Component', 'Values it shows'],
      rows: [
        ['Transition', 'opening, open, closing, closed'],
        ['Dialog, Drawer', 'open, closing, closed'],
        ['Popover, Tooltip, Toast', 'open, closing (opening shows as open: their CSS animates on mount)'],
        ['Collapse', 'open, closing, closed (opening shows as open)'],
      ],
    },
    {
      title: 'Presets',
      columns: ['enter / leave', 'Motion'],
      rows: [
        ['fade', 'Opacity only.'],
        ['scale', 'Fades and grows from 95%.'],
        ['slide-up', 'Moves up 1rem as it enters and as it leaves.'],
        ['slide-down', 'Moves down 1rem.'],
        ['slide-left', 'Moves toward the inline start (flips in RTL).'],
        ['slide-right', 'Moves toward the inline end (flips in RTL).'],
        ['collapse', 'Height from 0 to the measured content height. No fade.'],
      ],
    },
    {
      title: 'Motion tokens',
      columns: ['Token', 'Value'],
      rows: [
        ['--os-duration-fast', '120ms: tooltips, popovers, small hovers.'],
        ['--os-duration-base', '200ms: the Transition default.'],
        ['--os-duration-slow', '360ms: Collapse and larger surfaces.'],
        ['--os-ease-standard', 'cubic-bezier(0.2, 0, 0, 1): moves within the page.'],
        ['--os-ease-enter', 'cubic-bezier(0, 0, 0, 1): things arriving.'],
        ['--os-ease-exit', 'cubic-bezier(0.4, 0, 1, 1): things leaving.'],
        ['--os-transition-duration', 'Set on the Transition child: the duration in use (0ms under reduced motion).'],
        ['motion', "The same values in JS from '@onesmall/ui': motion.duration.base === 200."],
      ],
    },
  ],
  snippets: [
    {
      title: 'Your own classes',
      language: 'tsx',
      description: 'Anything that is not a preset name is used as class names while opening (enter) or closing (leave). No preset animation runs, so your CSS owns it.',
      code: `<Transition show={open} enter="rise-in" leave="sink-out" duration={motion.duration.slow}>
  <div className="hud">…</div>
</Transition>

/* CSS */
.rise-in  { animation: rise var(--os-transition-duration) var(--os-ease-enter) both; }
.sink-out { animation: rise var(--os-transition-duration) var(--os-ease-exit) reverse both; }
@keyframes rise { from { opacity: 0; transform: translateY(0.5rem); } }`,
    },
    {
      title: 'Styling by data-state',
      language: 'css',
      description: 'Target the shared vocabulary instead of component-specific classes.',
      code: `.my-panel[data-state='opening'],
.my-panel[data-state='closing'] { pointer-events: none; }

.os-dialog[data-state='closing'] { filter: blur(2px); }`,
    },
    {
      title: 'useTransition',
      language: 'tsx',
      description: 'The hook behind Transition, for elements you render yourself.',
      code: `const { state, mounted, duration } = useTransition(open, { appear: true, onExited: () => setItem(null) });

return mounted ? (
  <div className="sheet" data-state={state} style={{ '--os-transition-duration': \`\${duration}ms\` } as React.CSSProperties}>
    …
  </div>
) : null;`,
    },
  ],
  props: [
    {
      title: 'Transition',
      props: [
        { name: 'show', type: 'boolean', description: 'Shown (true) or hidden.' },
        { name: 'enter', type: 'TransitionPreset | string', default: "'fade'", description: 'A preset, or your own class names added while opening.' },
        { name: 'leave', type: 'TransitionPreset | string', default: 'enter', description: 'A preset, or class names added while closing.' },
        { name: 'unmountOnExit', type: 'boolean', default: 'false', description: 'Remove the child once closed. Otherwise it stays in the DOM with hidden.' },
        { name: 'appear', type: 'boolean', default: 'false', description: 'Animate in on first mount when show starts true.' },
        { name: 'duration', type: 'number', default: 'motion.duration.base (200)', description: 'Length of each phase in ms. 0 switches instantly.' },
        { name: 'onEnter / onEntered', type: '() => void', description: 'Opening started / finished.' },
        { name: 'onExit / onExited', type: '() => void', description: 'Closing started / finished.' },
        { name: 'children', type: 'ReactElement', description: 'One element that accepts className, style and a ref.' },
      ],
    },
    {
      title: 'useTransition(show, options)',
      props: [
        { name: 'options', type: 'appear, duration, onEnter, onEntered, onExit, onExited', description: 'As on Transition.' },
        { name: 'returns', type: '{ state, mounted, duration }', description: 'The current data-state, whether to render (state !== closed), and the duration in use (0 under reduced motion).' },
      ],
    },
  ],
  keyboard: [{ keys: 'None', action: 'Adds no keys of its own. Wire your trigger as a button with aria-expanded and aria-controls.' }],
  screenReader: [
    'A closed child gets the hidden attribute (or is unmounted), so it leaves the accessibility tree and the tab order.',
    'While closing, content is still readable until onExited. Move focus out before hiding focused content.',
    'Showing content is not announced. If it appears without user action, announce it with useAnnouncer.',
  ],
  dos: [
    'Use the default durations; slow, long motion is tiring.',
    'Set aria-expanded on the trigger and aria-controls to the child id.',
    'Use onExited to clean up (clear data, return focus) after the exit finishes.',
  ],
  donts: [
    "Don't rely on the animation to convey meaning: under reduced motion there is none.",
    "Don't wrap components that animate themselves (Dialog, Drawer, Popover, Tooltip, Toast, Collapse).",
    "Don't use collapse on elements with fixed heights; it animates to the measured content height.",
  ],
  a11y: [
    'Under prefers-reduced-motion (or data-os-motion="off" on <html>) the duration is 0 and every callback still fires, in the same order (2.3.3 Animation from Interactions, AAA).',
    'Toggling mid-animation reverses at once; no input is ignored.',
    'slide-left and slide-right follow the writing direction.',
  ],
  classes: '.os-transition[data-state][data-enter][data-leave] { --os-transition-duration }',
};

export default doc;

import type { PropDoc } from './PropsTable';

export interface ComponentDoc {
  slug: string;
  name: string;
  group: 'Actions' | 'Forms' | 'Feedback' | 'Overlays' | 'Navigation' | 'Data display' | 'Layout & media' | 'Drag & drop' | 'Theming';
  summary: string;
  importLine: string;
  examples: { name: string; title: string; description?: string }[];
  props?: { title: string; props: PropDoc[] }[];
  a11y: string[];
  classes?: string;
}

const color = "'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'";
const status = "'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'";

export const componentDocs: ComponentDoc[] = [
  {
    slug: 'button',
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
  },
  {
    slug: 'card',
    name: 'Card',
    group: 'Data display',
    summary: 'Groups related content. Surface, glass, outline and elevated variants, plus interactive lift and an animated edge glow.',
    importLine: "import { Card, CardHeader, CardBody, CardFooter, CardMedia } from 'onesmallui';",
    examples: [
      { name: 'card-basic', title: 'Variants' },
      { name: 'card-interactive', title: 'Interactive, media and glow' },
    ],
    props: [
      {
        title: 'Card',
        props: [
          { name: 'variant', type: "'surface' | 'glass' | 'outline' | 'elevated'", default: "'surface'", description: 'Background treatment.' },
          { name: 'interactive', type: 'boolean', description: 'Lift and glow on hover and focus-within.' },
          { name: 'glow', type: 'boolean', description: 'Animated light along the top edge.' },
          { name: 'as', type: 'ElementType', default: "'div'", description: 'Render as article, section, li…' },
        ],
      },
    ],
    a11y: [
      'Use as="article" for standalone items so they appear in screen reader landmarks and outlines.',
      'For clickable cards, put one real link in the heading and add .os-stretched-link instead of an onClick on the card.',
    ],
    classes: '.os-card[data-variant] > .os-card__header | __body | __footer | __media',
  },
  {
    slug: 'badge',
    name: 'Badge',
    group: 'Data display',
    summary: 'Compact status labels, with optional pulsing status dot.',
    importLine: "import { Badge } from 'onesmallui';",
    examples: [{ name: 'badge-basic', title: 'Colors, variants and dots' }],
    props: [
      {
        title: 'Badge',
        props: [
          { name: 'color', type: color, default: "'neutral'", description: 'Color role.' },
          { name: 'variant', type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: 'Visual weight.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size.' },
          { name: 'dot / pulse', type: 'boolean', description: 'Leading status dot, optionally animated.' },
        ],
      },
    ],
    a11y: ['Color is never the only signal: always include text.', 'The dot is decorative and hidden from assistive tech.'],
    classes: '.os-badge[data-color][data-variant]',
  },
  {
    slug: 'alert',
    name: 'Alert',
    group: 'Feedback',
    summary: 'Inline messages for status changes and things that need attention.',
    importLine: "import { Alert } from 'onesmallui';",
    examples: [{ name: 'alert-basic', title: 'Status colors and dismiss' }],
    props: [
      {
        title: 'Alert',
        props: [
          { name: 'color', type: status, default: "'info'", description: 'Color role and default icon.' },
          { name: 'title', type: 'ReactNode', description: 'Bold first line.' },
          { name: 'icon', type: 'ReactNode', description: 'Replace the default icon.' },
          { name: 'onDismiss', type: '() => void', description: 'Shows a 44px close button.' },
          { name: 'live', type: "'off' | 'polite' | 'assertive'", default: "'off'", description: 'Announce when it appears (role status or alert).' },
        ],
      },
    ],
    a11y: [
      'Set live="polite" for alerts that appear after an action, "assertive" only for urgent errors.',
      'Icons pair with text; meaning never relies on color alone.',
    ],
    classes: '.os-alert[data-color]',
  },
  {
    slug: 'forms',
    name: 'Field, Input, Textarea, Select',
    group: 'Forms',
    summary: 'Text inputs with labels, hints and errors wired up automatically. Wrap any control in Field.',
    importLine: "import { Field, Input, Textarea, Select } from 'onesmallui';",
    examples: [{ name: 'form-basic', title: 'A complete form', description: 'Submit with an invalid email to see error handling.' }],
    props: [
      {
        title: 'Field',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Required. Visible label linked to the control.' },
          { name: 'hint', type: 'ReactNode', description: 'Helper text linked with aria-describedby.' },
          { name: 'error', type: 'ReactNode', description: 'Error text; sets aria-invalid and is announced.' },
          { name: 'required', type: 'boolean', description: 'Adds required to the control and "(required)" for screen readers.' },
          { name: 'hideLabel', type: 'boolean', description: 'Visually hide the label (still announced).' },
        ],
      },
      {
        title: 'Input',
        props: [
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
          { name: 'startAdornment / endAdornment', type: 'ReactNode', description: 'Icons or units inside the field.' },
          { name: '...rest', type: 'InputHTMLAttributes', description: 'Every native input prop.' },
        ],
      },
      {
        title: 'Textarea',
        props: [
          { name: 'autoResize', type: 'boolean', description: 'Grow with content.' },
          { name: 'maxRows', type: 'number', default: '12', description: 'Growth limit.' },
        ],
      },
      {
        title: 'Select',
        props: [
          { name: 'options', type: '{ value, label, disabled? }[]', description: 'Options as data, or pass <option> children.' },
          { name: 'placeholder', type: 'string', description: 'Disabled first option.' },
        ],
      },
    ],
    a11y: [
      'Every control gets a programmatic label, and hints and errors are linked with aria-describedby.',
      'Select stays a native <select>, keeping mobile pickers and full screen reader support.',
      'Borders on controls meet 3:1 non-text contrast; placeholder text meets 7:1.',
      'Use autocomplete attributes (1.3.5) as shown in the example.',
    ],
    classes: '.os-field > .os-field__label + .os-input > .os-input__control',
  },
  {
    slug: 'selection',
    name: 'Checkbox, Radio, Switch',
    group: 'Forms',
    summary: 'Native selection controls with an animated custom look, descriptions and indeterminate state.',
    importLine: "import { Checkbox, RadioGroup, Radio, Switch } from 'onesmallui';",
    examples: [{ name: 'selection-controls', title: 'Selection controls' }],
    props: [
      {
        title: 'Checkbox',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Required label.' },
          { name: 'description', type: 'ReactNode', description: 'Secondary text.' },
          { name: 'indeterminate', type: 'boolean', description: 'Partially checked state.' },
        ],
      },
      {
        title: 'RadioGroup',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Rendered as the fieldset legend.' },
          { name: 'value / defaultValue', type: 'string', description: 'Selected value (controlled or not).' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Selection callback.' },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout from sm up.' },
        ],
      },
      {
        title: 'Switch',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Required label.' },
          { name: 'labelPosition', type: "'start' | 'end'", default: "'end'", description: 'Label side.' },
        ],
      },
    ],
    a11y: [
      'Real <input> elements keep native keyboard behavior: Space toggles, arrow keys move between radios.',
      'Switch uses role="switch" so it is announced as on/off.',
      'Each control has a 44px hit area.',
    ],
    classes: '.os-check, .os-radio-group, .os-switch',
  },
  {
    slug: 'modal',
    name: 'Modal & Drawer',
    group: 'Overlays',
    summary: 'Dialogs, side drawers and bottom sheets on the native <dialog> element, with enter and exit animations.',
    importLine: "import { Modal } from 'onesmallui';",
    examples: [
      { name: 'modal-basic', title: 'Dialog' },
      { name: 'modal-drawer', title: 'Drawers and bottom sheet' },
    ],
    props: [
      {
        title: 'Modal',
        props: [
          { name: 'open', type: 'boolean', description: 'Controls visibility.' },
          { name: 'onClose', type: '() => void', description: 'Escape, close button or backdrop click.' },
          { name: 'title', type: 'ReactNode', description: 'Required. Labels the dialog.' },
          { name: 'description', type: 'ReactNode', description: 'Describes the dialog.' },
          { name: 'footer', type: 'ReactNode', description: 'Action row.' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width.' },
          { name: 'placement', type: "'center' | 'left' | 'right' | 'bottom'", default: "'center'", description: 'Dialog, drawer or sheet.' },
          { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when the backdrop is clicked.' },
        ],
      },
    ],
    a11y: [
      'showModal() traps focus and makes the rest of the page inert.',
      'Focus returns to the element that opened it.',
      'Labelled by its title and described by its description.',
    ],
    classes: 'dialog.os-modal[data-size][data-placement] > .os-modal__panel',
  },
  {
    slug: 'tabs',
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
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    group: 'Navigation',
    summary: 'Expandable sections with a smooth height animation and no measuring.',
    importLine: "import { Accordion, AccordionItem } from 'onesmallui';",
    examples: [{ name: 'accordion-basic', title: 'Single open item' }],
    props: [
      {
        title: 'Accordion',
        props: [
          { name: 'type', type: "'single' | 'multiple'", default: "'single'", description: 'How many items may be open.' },
          { name: 'defaultValue / value', type: 'string[]', description: 'Open items.' },
          { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '3', description: 'Heading wrapping each trigger.' },
        ],
      },
    ],
    a11y: [
      'Each trigger is a button inside a heading with aria-expanded and aria-controls.',
      'Collapsed content is inert, so it is skipped by Tab and screen readers.',
    ],
    classes: '.os-accordion > .os-accordion__item[data-state]',
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    group: 'Overlays',
    summary: 'Short descriptions on hover and focus.',
    importLine: "import { Tooltip } from 'onesmallui';",
    examples: [{ name: 'tooltip-basic', title: 'Placements' }],
    props: [
      {
        title: 'Tooltip',
        props: [
          { name: 'content', type: 'ReactNode', description: 'Tooltip text.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Side.' },
          { name: 'delay', type: 'number', default: '300', description: 'Hover delay in ms (focus is instant).' },
        ],
      },
    ],
    a11y: [
      'Linked to its trigger with aria-describedby.',
      'Hoverable, persistent and dismissible with Escape (1.4.13).',
      'Never put essential information or interactive content in a tooltip.',
    ],
  },
  {
    slug: 'toast',
    name: 'Toast',
    group: 'Feedback',
    summary: 'Stacked notifications with actions, pause-on-hover timers, and slide animations.',
    importLine: "import { ToastProvider, useToast } from 'onesmallui';",
    examples: [{ name: 'toast-basic', title: 'Triggering toasts' }],
    props: [
      {
        title: 'ToastProvider',
        props: [
          { name: 'placement', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom'", default: "'bottom-right'", description: 'Screen corner.' },
          { name: 'defaultDuration', type: 'number | null', default: 'null', description: 'Auto-dismiss time. null keeps toasts until dismissed (2.2.3 AAA).' },
          { name: 'limit', type: 'number', default: '5', description: 'Max visible toasts.' },
        ],
      },
      {
        title: 'toast(options)',
        props: [
          { name: 'title', type: 'ReactNode', description: 'Main line.' },
          { name: 'description', type: 'ReactNode', description: 'Second line.' },
          { name: 'color', type: status, default: "'info'", description: 'Color role.' },
          { name: 'duration', type: 'number | null', description: 'Overrides the provider default.' },
          { name: 'action', type: '{ label, onClick }', description: 'Optional button.' },
        ],
      },
    ],
    a11y: [
      'Toasts are announced politely (danger toasts assertively).',
      'Timers pause on hover and focus; by default toasts never time out (WCAG 2.2.3 No Timing).',
    ],
  },
  {
    slug: 'loading',
    name: 'Progress, Spinner, Skeleton',
    group: 'Feedback',
    summary: 'Show progress and loading states.',
    importLine: "import { Progress, Spinner, Skeleton } from 'onesmallui';",
    examples: [{ name: 'loading-basic', title: 'Loading states' }],
    props: [
      {
        title: 'Progress',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Required accessible name.' },
          { name: 'value', type: 'number', description: 'Omit for indeterminate.' },
          { name: 'max', type: 'number', default: '100', description: 'Maximum.' },
          { name: 'showValue', type: 'boolean', description: 'Show the percentage.' },
          { name: 'color / size', type: 'StatusColor / Size', description: 'Look.' },
        ],
      },
      {
        title: 'Skeleton',
        props: [
          { name: 'shape', type: "'text' | 'rect' | 'circle'", default: "'text'", description: 'Placeholder shape.' },
          { name: 'lines', type: 'number', default: '1', description: 'Text lines.' },
          { name: 'width / height', type: 'CSS size', description: 'Dimensions.' },
        ],
      },
    ],
    a11y: [
      'Progress uses role="progressbar" with aria-valuenow.',
      'Spinners announce their label via role="status"; skeletons are hidden from assistive tech, so mark the region aria-busy.',
      'With reduced motion, spinners pulse slowly instead of spinning.',
    ],
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    group: 'Data display',
    summary: 'Pictures or initials, with presence status.',
    importLine: "import { Avatar } from 'onesmallui';",
    examples: [{ name: 'avatar-basic', title: 'Sizes and status' }],
    props: [
      {
        title: 'Avatar',
        props: [
          { name: 'name', type: 'string', description: 'Required. Used for the label and initials.' },
          { name: 'src', type: 'string', description: 'Image URL. Falls back to initials on error.' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size.' },
          { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Included in the accessible name.' },
          { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape.' },
        ],
      },
    ],
    a11y: ['Exposed as an image named "Name (status)", so status is not conveyed by color alone.'],
  },
  {
    slug: 'layout',
    name: 'Container, Stack, Grid',
    group: 'Layout & media',
    summary: 'Responsive layout primitives with per-breakpoint props.',
    importLine: "import { Container, Stack, Grid } from 'onesmallui';",
    examples: [{ name: 'layout-grid', title: 'Responsive layout', description: 'Resize your window to see columns and direction change.' }],
    props: [
      {
        title: 'Grid',
        props: [
          { name: 'columns', type: 'number | { base, sm, md, lg, xl }', default: '1', description: 'Column count per breakpoint.' },
          { name: 'minItemWidth', type: 'string', description: 'Auto-fit columns at least this wide.' },
          { name: 'gap', type: 'SpaceKey | responsive', default: '4', description: 'Gap on the 0.25rem scale.' },
        ],
      },
      {
        title: 'Stack',
        props: [
          { name: 'direction', type: "'row' | 'column' | responsive", default: "'column'", description: 'Flow.' },
          { name: 'gap', type: 'SpaceKey | responsive', default: '4', description: 'Spacing.' },
          { name: 'align / justify', type: 'CSS', description: 'Alignment.' },
          { name: 'wrap', type: 'boolean', description: 'Allow wrapping.' },
        ],
      },
      {
        title: 'Container',
        props: [{ name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'xl'", description: 'Max width.' }],
      },
    ],
    a11y: ['Layout never reorders content visually away from DOM order, so reading and focus order stay logical.'],
  },
  {
    slug: 'media',
    name: 'Image, Video, AspectRatio',
    group: 'Layout & media',
    summary: 'Responsive media with modern formats, lazy loading, blur-up fades, captions and fixed ratios.',
    importLine: "import { Image, Video, AspectRatio } from 'onesmallui';",
    examples: [{ name: 'media-basic', title: 'Images and video' }],
    props: [
      {
        title: 'Image',
        props: [
          { name: 'alt', type: 'string', description: 'Required. Use "" for decorative images.' },
          { name: 'sources', type: '{ srcSet, type?, media? }[]', description: 'AVIF/WebP/art-direction sources (renders <picture>).' },
          { name: 'ratio', type: 'number', description: 'Reserve space to avoid layout shift.' },
          { name: 'fit', type: "'cover' | 'contain'", default: "'cover'", description: 'Object fit.' },
          { name: 'caption', type: 'ReactNode', description: 'Wraps in <figure> with <figcaption>.' },
          { name: 'fallback', type: 'ReactNode', description: 'Shown if loading fails.' },
        ],
      },
      {
        title: 'Video',
        props: [
          { name: 'sources', type: '{ src, type? }[]', description: 'WebM, MP4, …' },
          { name: 'tracks', type: '{ src, srcLang, label, kind?, default? }[]', description: 'Captions and descriptions.' },
          { name: 'label', type: 'string', description: 'Accessible name.' },
          { name: 'ratio', type: 'number', default: '16 / 9', description: 'Aspect ratio.' },
        ],
      },
    ],
    a11y: [
      'alt is required by the types, so images can never ship without a decision about alternative text.',
      'Video accepts caption tracks (1.2.2) and audio descriptions (1.2.5 / 1.2.7).',
    ],
  },
  {
    slug: 'dropzone',
    name: 'DropZone',
    group: 'Drag & drop',
    summary: 'Upload areas with drag and drop, validation, previews, progress, and a headless hook for custom UIs.',
    importLine: "import { DropZone, useDropZone } from 'onesmallui';",
    examples: [
      { name: 'dropzone-basic', title: 'Validated drop zone', description: 'Images, video and PDF up to 10 MB, max 6 files. Try dropping something else.' },
      { name: 'dropzone-upload', title: 'Compact with upload progress' },
      { name: 'dropzone-headless', title: 'Headless hook' },
    ],
    props: [
      {
        title: 'DropZone',
        props: [
          { name: 'accept', type: 'string', description: 'Like the input accept attribute: "image/*,.pdf".' },
          { name: 'multiple', type: 'boolean', default: 'true', description: 'Allow several files.' },
          { name: 'maxSize / minSize', type: 'number', description: 'Bytes per file.' },
          { name: 'maxFiles', type: 'number', description: 'Total file limit.' },
          { name: 'validator', type: '(file) => string | null', description: 'Custom rule; return an error message.' },
          { name: 'onFilesAdded', type: '(files: File[]) => void', description: 'Each accepted batch.' },
          { name: 'onFilesRejected', type: '(rejections) => void', description: 'Rejected files with reasons.' },
          { name: 'onFilesChange', type: '(files: File[]) => void', description: 'Full list after any change.' },
          { name: 'progress', type: 'Record<fileName, number>', description: 'Upload progress per file.' },
          { name: 'size', type: "'md' | 'compact'", default: "'md'", description: 'Layout.' },
          { name: 'showFileList', type: 'boolean', default: 'true', description: 'Built-in list with previews and remove buttons.' },
        ],
      },
      {
        title: 'useDropZone(options)',
        props: [
          { name: 'getRootProps()', type: 'function', description: 'Spread on your drop area.' },
          { name: 'getInputProps()', type: 'function', description: 'Spread on a hidden file input.' },
          { name: 'open()', type: 'function', description: 'Opens the file picker.' },
          { name: 'isDragging / isDragReject', type: 'boolean', description: 'Drag state for styling.' },
        ],
      },
    ],
    a11y: [
      'A real file input sits inside the zone: Tab to it and press Enter or Space to browse.',
      'Added, rejected and removed files are announced in a live region.',
      'Each remove button is labelled with the file name.',
    ],
    classes: '.os-dropzone > .os-dropzone__area[data-state="idle|active|reject"]',
  },
  {
    slug: 'sortable',
    name: 'SortableList',
    group: 'Drag & drop',
    summary: 'Reorder items by dragging with mouse, touch or pen, or entirely by keyboard.',
    importLine: "import { SortableList } from 'onesmallui';",
    examples: [
      { name: 'sortable-basic', title: 'Vertical list with handles', description: 'Drag the grip, or focus it and press Space, then arrow keys.' },
      { name: 'sortable-horizontal', title: 'Horizontal, drag anywhere' },
    ],
    props: [
      {
        title: 'SortableList',
        props: [
          { name: 'items', type: 'T[]', description: 'Items in order.' },
          { name: 'getKey', type: '(item) => string | number', description: 'Stable key.' },
          { name: 'getItemLabel', type: '(item) => string', description: 'Name used in announcements.' },
          { name: 'onReorder', type: '(items, { from, to }) => void', description: 'New order.' },
          { name: 'renderItem', type: '(item, { isDragging, index }) => ReactNode', description: 'Item content.' },
          { name: 'label', type: 'string', description: 'Accessible list name.' },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Direction.' },
          { name: 'handle', type: 'boolean', default: 'true', description: 'Drag from the grip only.' },
        ],
      },
    ],
    a11y: [
      'Keyboard: Space or Enter picks up, arrows move, Home and End jump, Space drops, Escape cancels (2.1.1).',
      'Dragging is never the only way to reorder (2.5.7 Dragging Movements).',
      'Every pick-up, move and drop is announced.',
    ],
  },
  {
    slug: 'code',
    name: 'CodeBlock',
    group: 'Data display',
    summary: 'Code panels with a one-click copy button. Plug in any syntax highlighter.',
    importLine: "import { CodeBlock } from 'onesmallui';",
    examples: [{ name: 'code-basic', title: 'Copyable code' }],
    props: [
      {
        title: 'CodeBlock',
        props: [
          { name: 'code', type: 'string', description: 'Source text.' },
          { name: 'language', type: 'string', description: 'Label and data-language.' },
          { name: 'title', type: 'ReactNode', description: 'Header text, e.g. a file name.' },
          { name: 'renderCode', type: '(code, language) => ReactNode', description: 'Hook in Prism, Shiki, etc.' },
          { name: 'noCopy', type: 'boolean', description: 'Hide the copy button.' },
        ],
      },
    ],
    a11y: ['The scrollable <pre> is keyboard focusable.', 'Copy success is announced to screen readers.'],
  },
  {
    slug: 'theme',
    name: 'ThemeProvider & ThemeToggle',
    group: 'Theming',
    summary: 'Light, dark and system themes, remembered between visits.',
    importLine: "import { ThemeProvider, ThemeToggle, useTheme } from 'onesmallui';",
    examples: [{ name: 'theme-basic', title: 'Switching themes' }],
    props: [
      {
        title: 'ThemeProvider',
        props: [
          { name: 'defaultMode', type: "'light' | 'dark' | 'system'", default: "'system'", description: 'Initial mode.' },
          { name: 'mode / onModeChange', type: 'ThemeMode', description: 'Controlled mode.' },
          { name: 'storageKey', type: 'string | false', default: "'onesmallui-theme'", description: 'localStorage key, or false.' },
        ],
      },
      {
        title: 'useTheme()',
        props: [
          { name: 'mode', type: 'ThemeMode', description: 'What the user picked.' },
          { name: 'resolvedTheme', type: "'light' | 'dark'", description: 'What is showing.' },
          { name: 'setMode / toggle', type: 'function', description: 'Change it.' },
        ],
      },
    ],
    a11y: ['Both themes pass AAA contrast for every token pair.', 'The toggle announces the theme it will switch to.'],
  },
  {
    slug: 'hooks',
    name: 'Hooks',
    group: 'Theming',
    summary: 'Utility hooks the components are built on. No Redux, no global store.',
    importLine: "import { useBreakpoint, useMediaQuery, usePrefersReducedMotion, useDisclosure, useCopyToClipboard, useControllableState, useDropZone } from 'onesmallui';",
    examples: [{ name: 'hooks-basic', title: 'Responsive and preference hooks' }],
    props: [
      {
        title: 'Hooks',
        props: [
          { name: 'useBreakpoint(bp)', type: 'boolean', description: 'True at or above sm | md | lg | xl | 2xl | 3xl.' },
          { name: 'useMediaQuery(query)', type: 'boolean', description: 'Any media query; SSR-safe.' },
          { name: 'usePrefersReducedMotion()', type: 'boolean', description: 'OS reduced-motion setting.' },
          { name: 'useDisclosure(initial?)', type: '{ isOpen, open, close, toggle }', description: 'Open state for overlays.' },
          { name: 'useCopyToClipboard(ms?)', type: '{ copy, copied }', description: 'Clipboard with fallback.' },
          { name: 'useControllableState(v, d, cb)', type: '[value, setValue]', description: 'Controlled/uncontrolled props.' },
        ],
      },
    ],
    a11y: [],
  },
];

export const groups = Array.from(new Set(componentDocs.map((d) => d.group)));

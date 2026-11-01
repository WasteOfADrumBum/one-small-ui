import type { ComponentDoc } from '../site/docTypes';
import { status } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'rating',
  order: 53.2,
  name: 'Rating',
  group: 'Forms',
  summary:
    'A star rating built on native radio buttons: whole or half steps, hover and focus preview, optional clearing, custom icons, sizes and colors, and a read-only display that reads "4.5 out of 5 stars". Works in Field and Form and submits natively.',
  importLine: "import { Rating } from '@onesmall/ui';",
  examples: [
    {
      name: 'rating-basic',
      title: 'Half steps, clearing, max, custom icon, disabled and read only',
      description: 'Hover or focus previews a value without choosing it. The first rating clears when you choose its current value again.',
    },
    {
      name: 'rating-form',
      title: 'In a form, with Field',
      description: 'Service is required, so submitting without it shows the browser message in the Field. The average is a read-only display.',
    },
  ],
  props: [
    {
      title: 'Rating',
      props: [
        { name: 'label', type: 'ReactNode', description: 'Group label, rendered as the legend. Inside a Field, leave it out: the Field label names the group.' },
        { name: 'value / defaultValue', type: 'number | null', default: 'null', description: 'The rating (controlled / uncontrolled). null is no rating.' },
        { name: 'onValueChange', type: '(value: number | null) => void', description: 'Called with the new value, or null when cleared.' },
        { name: 'max', type: 'number', default: '5', description: 'Number of icons.' },
        { name: 'precision', type: '1 | 0.5', default: '1', description: 'Whole or half steps. Half steps add one radio per half.' },
        { name: 'allowClear', type: 'boolean', description: 'Choosing the current value again (click, or Space on the checked option) clears it and announces "Rating cleared".' },
        { name: 'readOnly', type: 'boolean', description: 'A display: one role="img" named "4.5 out of 5 stars", no inputs. The drawing rounds to precision; the name keeps the exact value. Field sets it.' },
        { name: 'name', type: 'string', description: 'Submits the checked value. Read-only ratings submit a hidden input; disabled ones submit nothing.' },
        { name: 'required / disabled / invalid', type: 'boolean', description: 'States (Field sets them). required uses native radio validation.' },
        { name: 'icon', type: 'ComponentType<{ className?: string }>', default: 'StarIcon', description: 'The shape for each step, such as HeartIcon. Drawn outlined when empty and filled when chosen.' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Icon size. Hit areas do not shrink with it: whole steps are 44×44px; with half steps each star is 48×44px, split into two 24×44px targets (WCAG 2.5.8 AA, not the 44px AAA size).' },
        { name: 'color', type: status, default: "'warning'", description: 'Fill color. Filled icons also get a dark outline, so light colors keep 3:1.' },
        { name: 'getLabel', type: '(value, max) => string', default: '"3 stars"', description: 'Name of each option, for translation or other units.' },
        { name: 'getValueText', type: '(value | null, max) => string', default: '"4.5 out of 5 stars"', description: 'Name of a read-only rating ("No rating" when null).' },
        { name: 'clearedMessage', type: 'string', default: '"Rating cleared"', description: 'Announced when allowClear clears the rating.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves into the rating, onto the chosen option (or the first one when there is none), and on out of it.' },
    { keys: 'Right Arrow / Down Arrow', action: 'Chooses the next step. Browsers swap Left and Right in right-to-left layouts.' },
    { keys: 'Left Arrow / Up Arrow', action: 'Chooses the previous step.' },
    { keys: 'Space', action: 'Chooses the focused option. With allowClear, on the chosen option it clears the rating.' },
  ],
  screenReader: [
    'Announced as a radio group named by the legend or the Field label ("Service, required, radio group"), then the option: "3 stars, radio button, checked, 3 of 5".',
    'Hint and error from a Field are linked to the group with aria-describedby; errors set aria-invalid.',
    'The icons are aria-hidden; each radio carries its own name, so the value never depends on the picture.',
    'Clearing with allowClear is announced politely through useAnnouncer ("Rating cleared").',
    'Read-only ratings are a single image, "4.5 out of 5 stars", prefixed by the Field label when there is one.',
  ],
  dos: [
    'Put it in a Field, or give it a label, so the group says what is being rated.',
    'Say what the ends mean in the hint ("1 is poor, 5 is excellent").',
    'Show the count or the number next to a read-only average, as in "4.5 · 1,284 reviews".',
    'Use allowClear when a rating is optional, and say so in the hint.',
  ],
  donts: [
    "Don't use half steps for input unless people need them; whole steps are faster to choose and have larger targets.",
    "Don't use an interactive Rating to display an average; use readOnly so it isn't read as a question.",
    "Don't rely on the color to show the value: keep the default filled-versus-outlined shapes when you pass a custom icon.",
  ],
  a11y: [
    'Native radio inputs in a fieldset (role="radiogroup", so aria-invalid and aria-required are valid), visually transparent and laid over each icon as its hit area.',
    'Whole steps are 44×44px targets. Half steps are 24px wide by 44px tall each, which meets WCAG 2.5.8; use whole steps where the 44px AAA target matters.',
    'Chosen and empty steps differ in shape (filled versus outlined), not only color; the filled icon has a 3:1 outline. Focus draws the standard focus ring around the icon.',
    'Half fills and half hit areas use logical boxes, so they sit at the inline start in right-to-left documents.',
    'Respects reduced motion (the hover scale uses motion tokens) and forced colors (system colors for outline and fill).',
  ],
  classes: `.os-rating[data-size][data-color][data-precision="whole|half"][data-preview][data-invalid][data-disabled][data-readonly]
  > legend + .os-rating__items > .os-rating__item[data-hovered]
  > .os-rating__glyph[data-fill="full|half|empty"] > .os-rating__icon + .os-rating__fill > .os-rating__icon
  + .os-rating__input[data-half]`,
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'helpers',
  order: 90,
  name: 'Helpers',
  group: 'Utilities',
  summary: 'Small multi-property helpers: focus ring, hover lift, icon links, fixed and sticky positioning, horizontal and vertical stacks, stretched links, multi-line clamps, the vertical rule and visually hidden content.',
  examples: [
    {
      name: 'helpers-basic',
      title: 'Focus ring, icon link, stacks, vertical rule, hover lift and stretched link',
    },
    {
      name: 'helpers-text',
      title: 'Truncation and visually hidden',
    },
    {
      name: 'helpers-position',
      title: 'Sticky positioning',
    },
  ],
  reference: [
    {
      title: 'Helper classes',
      columns: ['Class', 'Effect'],
      rows: [
        [
          '.os-focus-ring',
          'Library focus ring on :focus-visible. data-color, --os-focus-ring-color, -width and -offset customize it.',
        ],
        [
          '.os-hover-lift',
          'Lifts with a shadow on hover and focus-within (no movement with reduced motion).',
        ],
        [
          '.os-icon-link, .os-icon-link-hover',
          'Text + 1em icon with a gap; the hover variant nudges the trailing icon in the reading direction.',
        ],
        ['.os-fixed-top, .os-fixed-bottom', 'Pinned to the viewport edge.'],
        ['.os-sticky-top, .os-sticky-bottom', 'Sticky; responsive (md:os-sticky-top).'],
        ['.os-hstack, .os-vstack', 'Flex row (centered) or column; add .os-gap-*.'],
        ['.os-stretched-link', "Makes a link's click area cover its positioned parent."],
        ['.os-truncate, .os-line-clamp-{1-6}, .os-line-clamp-none', 'Single- and multi-line truncation.'],
        ['.os-vr', 'Vertical rule for flex rows.'],
        [
          '.os-visually-hidden (= .os-sr-only), .os-visually-hidden-focusable (= .os-focusable-sr)',
          'Hidden visually, still announced; the focusable one appears on focus.',
        ],
        ['.os-clearfix, .os-ratio', 'Clear floats; fill an aspect-ratio box with its child.'],
      ],
    },
  ],
  a11y: [
    'Use .os-focus-ring only on elements that are actually focusable, and keep at least 3:1 against the background; data-color uses the AAA -text shades.',
    'Fixed and sticky bars must not cover the focused element (2.4.11); add scroll-padding to the page if they do.',
    'Clamped and truncated text stays in the DOM, so screen readers read all of it; make sure the full text is available visually too (a details page or a title).',
    '.os-vr is decorative: add aria-hidden="true", or role="separator" if it separates groups of controls.',
  ],
};

export default doc;

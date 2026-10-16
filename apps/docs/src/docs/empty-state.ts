import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'empty-state',
  order: 45,
  name: 'EmptyState',
  group: 'Feedback',
  summary:
    'What to show when there is nothing to show: no data yet, no matching results, a failed load or a first visit. A decorative icon or illustration, a heading at the level your outline needs, a description and main and secondary actions, in a default and a compact size.',
  importLine: "import { EmptyState } from '@onesmall/ui';",
  examples: [
    {
      name: 'empty-state-basic',
      title: 'Heading, description and actions',
      description: 'Lead with what the space is for and one clear next step. Secondary actions sit underneath.',
    },
    {
      name: 'empty-state-presets',
      title: 'Presets',
      description:
        '`no-data`, `no-results`, `error` and `first-use` fill in the icon and copy. `onClearFilters` and `onRetry` add the preset’s button. Every text can be overridden.',
    },
  ],
  props: [
    {
      title: 'EmptyState',
      props: [
        { name: 'preset', type: "'no-data' | 'no-results' | 'error' | 'first-use'", description: 'Fills in the icon, title and description.' },
        { name: 'title', type: 'ReactNode', description: 'The heading. Defaults to the preset’s.' },
        { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', default: '2', description: 'Heading element, to fit the page outline.' },
        { name: 'description', type: 'ReactNode', description: 'Supporting text. Defaults to the preset’s.' },
        { name: 'icon', type: 'ReactNode | false', description: 'Decorative icon. Replaces the preset’s; false hides it.' },
        { name: 'illustration', type: 'ReactNode', description: 'A larger decorative picture (img with alt="" or an SVG), shown instead of the icon.' },
        { name: 'actions', type: 'ReactNode', description: 'The main action, usually one Button.' },
        { name: 'secondaryActions', type: 'ReactNode', description: 'Less important actions, such as a link to help.' },
        { name: 'size', type: "'default' | 'compact'", default: "'default'", description: 'compact for tables, menus, lists and other tight spaces.' },
        { name: 'onClearFilters', type: '() => void', description: 'With preset="no-results", adds a Clear filters button.' },
        { name: 'onRetry', type: '() => void', description: 'With preset="error", adds a Try again button.' },
        { name: 'labels', type: 'Partial<{ clearFilters: string; retry: string }>', description: 'Texts of the preset buttons, for translation.' },
        { name: 'children', type: 'ReactNode', description: 'Extra content between the description and the actions.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab / Shift + Tab', action: 'Moves through the preset button, the main actions, then the secondary actions.' },
    { keys: 'Enter / Space', action: 'Activates the focused action.' },
  ],
  screenReader: [
    'The heading is a real h2 to h6, so the empty state shows up in heading navigation under the section it belongs to.',
    'The icon or illustration is aria-hidden: the heading and description carry the meaning, so the error preset is never told by color alone.',
    'EmptyState is not a live region. When it replaces content after an action (a search, a failed load), announce it with useAnnouncer, as DataTable and CommandPalette do.',
    'After Clear filters or Try again replaces the empty state, move focus somewhere useful (the search field or the first result), or it falls back to the page.',
  ],
  dos: [
    'Say why the space is empty and what to do next, in one short sentence.',
    'Offer one main action; put the rest in secondaryActions.',
    'Pick a headingLevel one below the heading of the section it sits in.',
    'Use size="compact" inside tables, menus, popovers and lists.',
  ],
  donts: [
    "Don't use an empty state for loading; show a Spinner or Skeleton until you know there is nothing.",
    "Don't put meaning in the illustration; it is hidden from screen readers.",
    "Don't blame the user in error copy; say what failed and how to retry.",
  ],
  a11y: [
    'Title text uses the text token and the description text-muted, both 7:1 on the surface in light and dark.',
    'Preset buttons are Buttons with a 44px target (the compact size extends the hit area) and a visible focus ring.',
    'Logical properties only, so it mirrors in RTL; no motion.',
  ],
  classes:
    '.os-empty-state[data-size="compact"][data-preset] > .os-empty-state__media[data-kind="icon"|"illustration"] + .os-empty-state__title + .os-empty-state__description + .os-empty-state__actions > .os-empty-state__primary + .os-empty-state__secondary',
};

export default doc;

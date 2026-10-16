import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'timeline',
  order: 70,
  name: 'Timeline',
  group: 'Data display',
  summary:
    'Events in order on an ordered list: a status icon or avatar, title, date, description and actions. Vertical, alternating or horizontal; "Show more" for long histories; and a feed variant for activity logs with relative times.',
  importLine: "import { Timeline, TimelineItem } from '@onesmall/ui';",
  examples: [
    {
      name: 'timeline-basic',
      title: 'Statuses, dates and actions',
      description: 'Each status has its own icon and a visually hidden prefix ("Success:"), so color is never the only cue. `time` takes a `Date` or an ISO string and renders `<time datetime>`.',
    },
    { name: 'timeline-alternating', title: 'Alternating', description: 'Both sides of the line when the timeline is at least 36rem wide (a container query), one side when narrower.' },
    { name: 'timeline-horizontal', title: 'Horizontal', description: 'A row that scrolls sideways on small screens without making the page scroll.' },
    { name: 'timeline-show-more', title: 'Show more', description: 'With `pageSize`, a button reveals the next batch, focuses its first event and announces how many were added.' },
    {
      name: 'timeline-feed',
      title: 'Activity feed',
      description: 'Avatar, actor, action and a relative time, with the full date in a Tooltip. The server renders absolute dates and relative text switches in after hydration, unless you pass `now`.',
    },
  ],
  props: [
    {
      title: 'Timeline',
      props: [
        { name: 'layout', type: "'vertical' | 'alternating' | 'horizontal'", default: "'vertical'", description: 'Line down the start edge, centered with items on both sides, or a sideways row.' },
        { name: 'variant', type: "'default' | 'feed'", default: "'default'", description: 'feed: avatars, actor and action, relative times.' },
        { name: 'pageSize', type: 'number', description: 'Shows this many items, then a "Show more" button for the next batch.' },
        { name: 'visibleCount / defaultVisibleCount', type: 'number', default: 'pageSize', description: 'How many items are shown, controlled or uncontrolled.' },
        { name: 'onVisibleCountChange', type: '(count: number) => void', description: 'Called when "Show more" reveals items.' },
        { name: 'locale', type: 'string', description: 'Locale for dates and relative times. Pass it when server rendering.' },
        { name: 'timeZone', type: 'string', description: "IANA zone for dates, e.g. 'Europe/London'. Pass it when server rendering." },
        { name: 'dateFormat', type: 'Intl.DateTimeFormatOptions', default: "{ dateStyle: 'medium', timeStyle: 'short' }", description: 'Format of item dates. Date-only strings never show a time.' },
        { name: 'now', type: 'Date | number', description: 'Feed: the time relative times are measured from. Without it they update every 30 seconds after hydration.' },
        { name: 'statusLabels', type: '{ success?, warning?, danger?, info?, pending? }', default: "{ success: 'Success', warning: 'Warning', danger: 'Error', info: 'Info', pending: 'Pending' }", description: 'Screen reader status text, for translation.' },
        { name: 'showMoreLabel', type: 'ReactNode', default: "'Show more'", description: 'Text of the button.' },
        { name: 'moreShownLabel', type: '(count: number) => string', default: '"5 more events shown"', description: 'Announcement after Show more.' },
        { name: 'aria-label / aria-labelledby', type: 'string', default: "'Timeline'", description: 'Names the list, and the scroll region when a horizontal timeline overflows.' },
      ],
    },
    {
      title: 'TimelineItem',
      props: [
        { name: 'title', type: 'ReactNode', description: 'What happened.' },
        { name: 'time', type: 'Date | string', description: 'When. Rendered in <time dateTime>. "2026-10-01" is a calendar day in any time zone.' },
        { name: 'timeLabel', type: 'ReactNode', description: 'Replaces the formatted date text; dateTime still comes from time.' },
        { name: 'description', type: 'ReactNode', description: 'Secondary text.' },
        { name: 'status', type: "'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending'", default: "'default'", description: 'Icon, color and hidden status text. default is a plain dot.' },
        { name: 'marker', type: 'ReactNode', description: 'Replaces the status icon: another icon or an Avatar. Decorative (aria-hidden).' },
        { name: 'actions', type: 'ReactNode', description: 'Buttons or links under the content.' },
        { name: 'actor / avatarSrc / action', type: 'string / string / ReactNode', description: 'Feed: who, their picture (initials otherwise) and what they did. Replace title.' },
        { name: 'children', type: 'ReactNode', description: 'Extra content under the description.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves to actions inside items, the "Show more" button, feed times (to show their full date) and, when a horizontal timeline overflows, its scroll region.' },
    { keys: 'Enter / Space', action: 'On "Show more": reveals the next batch and moves focus to its first event.' },
    { keys: 'ArrowLeft / ArrowRight', action: 'On a focused horizontal scroll region: scrolls it.' },
    { keys: 'Escape', action: 'Closes a feed time’s tooltip.' },
  ],
  screenReader: [
    'An ordered list, so screen readers say "list, 5 items" and each position. Items are read in order: status, title, date, description.',
    'Status is a visually hidden prefix on the title ("Success: Launch"); the icon and marker are aria-hidden.',
    'Dates are <time datetime>, so the machine-readable value travels with the text.',
    'Show more: focus moves to the first new event (tabindex="-1") and "5 more events shown" is announced politely through the shared announcer.',
    'Feed: the actor and action are read as one sentence; the avatar is hidden because the actor is already in the text. The relative time is focusable and described by the tooltip, so it reads "4 minutes ago, Friday, October 16, 2026 at 9:41 AM".',
  ],
  dos: [
    'Name the timeline with aria-label or aria-labelledby.',
    'Pass locale and timeZone when server rendering, so server and client format dates the same way.',
    'Use pageSize for long histories instead of rendering hundreds of events at once.',
    'Put meaning in the title or action text; markers are decorative.',
  ],
  donts: [
    "Don't use a Timeline for steps a user moves through; use Stepper.",
    "Don't rely on the marker color or a custom marker to say what happened.",
    "Don't put essential information only in the feed tooltip; it repeats the date, nothing more.",
  ],
  a11y: [
    'Status never relies on color: every status has its own icon (check, triangle, cross, i, clock), pending also has a dashed ring, and the status is in the text for screen readers. Icon colors are the AAA *-text tokens.',
    'A horizontal timeline becomes a focusable, named scroll region only when it overflows (WCAG 2.1.1). It uses logical properties, so alternating and horizontal layouts mirror in RTL.',
    'SSR safe. Feed relative times come from Intl.RelativeTimeFormat; one shared 30 second clock serves every feed on the page.',
  ],
  classes:
    '.os-timeline[data-layout][data-variant] > .os-timeline__viewport > ol.os-timeline__list > li.os-timeline__item[data-status] > .os-timeline__marker (> .os-timeline__badge) + .os-timeline__body > .os-timeline__header > .os-timeline__title (> .os-timeline__actor) + time.os-timeline__time\n.os-timeline__description · .os-timeline__content · .os-timeline__actions · .os-timeline__more  (--os-timeline-gap, --os-timeline-marker-size, --os-timeline-item-min)',
};

export default doc;

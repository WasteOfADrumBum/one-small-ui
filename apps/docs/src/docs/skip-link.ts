import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'skip-link',
  order: 60,
  name: 'Skip link',
  group: 'Accessibility',
  summary:
    'A "Skip to main content" link that stays out of sight until it gets keyboard focus. It lets keyboard and screen reader users jump past the header and navigation on every page.',
  importLine: "import { SkipLink } from '@onesmall/ui';",
  examples: [
    {
      name: 'skip-link-basic',
      title: 'Skipping past navigation',
      description: 'Press Tab into the preview: the link appears. Press Enter and focus moves to the flight plan.',
    },
  ],
  snippets: [
    {
      title: 'In your app shell',
      language: 'tsx',
      description: 'Render it first, before the header, and give the main landmark the matching id.',
      code: `<SkipLink href="#main" />
<header>…</header>
<main id="main">…</main>`,
    },
  ],
  props: [
    {
      title: 'SkipLink',
      props: [
        { name: 'href', type: 'string', description: 'In-page target, e.g. "#main". Takes precedence over targetId.' },
        { name: 'targetId', type: 'string', default: "'main'", description: 'Target id without the #. Kept for compatibility; prefer href.' },
        { name: 'children', type: 'ReactNode', default: "'Skip to main content'", description: 'Link text.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab', action: 'From the top of the page, focuses the link and shows it.' },
    { keys: 'Enter', action: 'Moves focus to the target and scrolls it into view.' },
  ],
  screenReader: [
    'The link is always in the accessibility tree, so screen reader users find it first in the page.',
    'The target gets tabindex="-1" if it is not focusable, so focus really moves there and the next Tab continues from it.',
    'The URL hash is not changed, so hash routers are unaffected.',
  ],
  dos: [
    'Make it the first focusable element on the page.',
    'Point it at the <main> landmark, or the first heading of the content.',
    'Use plain wording: "Skip to main content".',
  ],
  donts: [
    "Don't hide it with display: none or visibility: hidden; it must be focusable.",
    "Don't point it at an element that is missing on some pages.",
  ],
  a11y: [
    'Meets WCAG 2.4.1 Bypass Blocks.',
    'Shown on focus with a double focus ring (focus color plus an on-primary inner ring) that contrasts with the link and the page (2.4.13 Focus Appearance, AAA).',
    'Text is on-primary on primary: 7:1 or better in both themes.',
  ],
  classes: 'a.os-skip-link',
};

export default doc;

import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'command-palette',
  order: 60,
  name: 'CommandPalette',
  group: 'Navigation',
  summary:
    'A search-first command menu in a modal dialog, opened with Mod+K. Fuzzy search with keywords, grouped results, keyboard shortcuts, nested pages, recent items and async results, on an ARIA 1.2 combobox. This site uses it: press Mod+K or the Search docs button in the header.',
  importLine: "import { CommandPalette, fuzzyMatch, fuzzyFilter } from '@onesmall/ui';",
  examples: [
    {
      name: 'command-palette-basic',
      title: 'Actions, links and a nested page',
      description:
        'Change theme opens a sub-list: Backspace on an empty input or Escape goes back. Disabled items stay visible but the arrow keys skip them.',
    },
    {
      name: 'command-palette-async',
      title: 'Async results',
      description:
        'loadItems runs after a debounce and gets an AbortSignal, so only the latest request counts. The list is aria-busy while loading.',
    },
    { name: 'command-palette-recent', title: 'Recent items', description: 'Opt in with recent: chosen items are kept in localStorage and listed first.' },
  ],
  snippets: [
    {
      title: 'Next.js links',
      language: 'tsx',
      description: 'Items with href render as links. Pass as (or render) to use your router’s link, so navigation stays client-side.',
      code: `import Link from 'next/link';
import { CommandPalette } from '@onesmall/ui';

const items = [
  { id: 'billing', label: 'Billing', href: '/settings/billing', as: Link },
  { id: 'team', label: 'Team', href: '/settings/team', render: (props) => <Link {...props} prefetch={false} /> },
];

export function AppSearch() {
  return <CommandPalette items={items} />;
}`,
    },
  ],
  props: [
    {
      title: 'CommandPalette',
      props: [
        { name: 'open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open) => void', default: 'false', description: 'Controlled or uncontrolled open state.' },
        { name: 'hotkey', type: 'string | string[] | false', default: "'Mod+K'", description: 'Opens and closes the palette (useHotkeys). Combos with a modifier also work inside text fields; false turns it off.' },
        { name: 'items', type: 'CommandItem[]', description: 'A flat list. Items that share a group are listed under that heading.' },
        { name: 'groups', type: 'CommandGroup[]', description: '{ id?, heading?, items }[]: grouped data, as an alternative to items.' },
        { name: 'query / defaultQuery / onQueryChange', type: 'string / string / (query) => void', description: 'Controlled or uncontrolled search text. It resets when the palette closes or the page changes.' },
        { name: 'placeholder', type: 'string', default: "'Type a command or search…'", description: 'Input placeholder. A nested page can set its own.' },
        { name: 'label', type: 'string', default: "'Command palette'", description: 'Accessible name of the dialog.' },
        { name: 'inputLabel', type: 'string', default: "'Search commands'", description: 'Accessible name of the search input.' },
        { name: 'emptyState', type: 'ReactNode | (query) => ReactNode', description: 'Shown when nothing matches.' },
        { name: 'recent', type: '{ storageKey: string; max?: number; label?: string }', description: 'Opt in to a Recent group (default 5 items) stored in localStorage. Read after mount, so SSR is safe; blocked storage is ignored.' },
        { name: 'loadItems', type: '(query, { signal }) => Promise<CommandGroup[]>', description: 'Async results for the top level, shown after the static items. Stale requests are aborted.' },
        { name: 'debounce', type: 'number', default: '200', description: 'Milliseconds after typing before loadItems runs.' },
        { name: 'filter', type: '((item, query) => boolean | number) | false', description: 'Replaces the built-in fuzzy search: false or ≤ 0 hides, true keeps, a number ranks. false turns local filtering off (server-filtered results).' },
        { name: 'renderItem', type: '(item, { active, query, label }) => ReactNode', description: 'Custom option content. label is the highlighted label. The option element and its accessible name stay the same.' },
        { name: 'onSelect', type: '(item) => void', description: 'Called for every chosen item, after the item’s own onSelect.' },
        { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'Close after choosing an item. Choosing closes at once, without the exit animation, so focus can follow the action.' },
        { name: 'labels', type: 'Partial<CommandPaletteLabels>', description: 'root, breadcrumb, listbox, close, loading, error and results(count), for translation.' },
        { name: 'appearance / animation', type: "OverlayAppearance / DialogAnimation", default: "'default' / 'scale'", description: 'Passed to Dialog.' },
        { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'The search input.' },
      ],
    },
    {
      title: 'CommandItem',
      props: [
        { name: 'id', type: 'string', description: 'Unique in the palette; what recent stores.' },
        { name: 'label', type: 'string', description: 'Visible text, searched, and the option’s accessible name.' },
        { name: 'keywords', type: 'string[]', description: 'Hidden aliases that also match.' },
        { name: 'icon / description', type: 'ReactNode', description: 'Decorative icon and a second line. The description is the option’s accessible description.' },
        { name: 'shortcut', type: 'string', description: "A combo such as 'Mod+S', shown with Kbd. Display only: bind it with useHotkeys." },
        { name: 'disabled', type: 'boolean', description: 'Shown, skipped by the arrow keys, not selectable.' },
        { name: 'group', type: 'string', description: 'Heading to list it under, for flat items.' },
        { name: 'href / as / render', type: 'string / ElementType / (props) => ReactElement', description: 'Makes the option a link; as or render swap in a router link. Enter clicks the option, so the link’s own handler runs.' },
        { name: 'onSelect', type: '(item) => void', description: 'Called when chosen.' },
        { name: 'children / placeholder', type: 'CommandItem[] / string', description: 'Turns the item into a nested page, with its own placeholder.' },
      ],
    },
    {
      title: 'Fuzzy helpers',
      props: [
        { name: 'fuzzyMatch(query, text)', type: '{ score, indices } | null', description: 'Case-insensitive subsequence match. Word starts and consecutive runs score higher; whitespace in the query is ignored.' },
        { name: 'fuzzyFilter(items, query, { getText, getKeywords })', type: '{ item, score, indices }[]', description: 'Filters and sorts best first. Keyword matches rank just below label matches.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Mod + K', action: 'Opens the palette from anywhere (⌘K on Apple platforms, Ctrl+K elsewhere); closes it when open.' },
    { keys: 'Down arrow / Up arrow', action: 'Moves to the next or previous item, skipping disabled ones, and wraps.' },
    { keys: 'Home / End', action: 'Moves to the first or last item.' },
    { keys: 'Enter', action: 'Chooses the active item: runs it, follows its link, or opens its page.' },
    { keys: 'Escape', action: 'Goes back a page when nested, otherwise closes and returns focus to where it was.' },
    { keys: 'Backspace', action: 'On an empty input, goes back a page.' },
    { keys: 'Tab / Shift + Tab', action: 'Moves between the breadcrumb, input and close button; focus stays inside the dialog.' },
  ],
  screenReader: [
    'The dialog is named by label. Focus lands on the input, a combobox with aria-expanded, aria-controls and aria-autocomplete="list".',
    'The active option is aria-activedescendant on the input and aria-selected="true", so focus never leaves the input while you arrow.',
    'Each group is role="group" named by its heading. Options are named by their plain label (aria-label), so the <mark> highlights never split the name; the description and the spoken shortcut ("Control N") are the accessible description.',
    'After typing settles (500ms), the result count is announced through useAnnouncer: "12 results", "No results". Entering a page announces its name too. Load errors are announced assertively.',
    'While loading, the listbox is aria-busy and a visible "Loading results" row is shown.',
    'The breadcrumb is a nav landmark named "Command pages", with the current page marked aria-current="page".',
  ],
  dos: [
    'Show the shortcut on a visible button too, like the Search docs button in this site’s header.',
    'Add keywords for the words people will try: "preferences" for Settings, "modal" for Dialog.',
    'Use nested pages for choices that belong to one command (theme, language, assignee).',
    'Pass the AbortSignal from loadItems to fetch.',
  ],
  donts: [
    "Don't make the palette the only way to reach a feature.",
    "Don't register a second Mod+K palette on the same page; pass hotkey={false} to extra ones.",
    "Don't put buttons or links inside renderItem content; the whole option is the control.",
  ],
  a11y: [
    'Built on Dialog: modal, focus trapped, page inert, focus returned on close. Full screen below the sm breakpoint.',
    'Options are at least 44px tall. Highlights are bold and underlined, not color alone.',
    'Disabled items keep aria-disabled and stay in the list, so screen reader users know they exist.',
    'SSR safe: recent items are read in an effect and the hotkey listener is added after mount.',
    'The listbox is the scroll container, so axe treats it as the combobox popup that the arrow keys scroll. With a hash router, navigate in onSelect: axe’s skip-link rule flags off-screen href="#route" links whose target id doesn’t exist.',
  ],
  classes:
    '.os-command-palette (on the dialog), __search, __input, __close, __breadcrumb, __crumb, __results, __list, __group, __heading, __item, __item-icon, __item-text, __item-label, __item-description, __item-shortcut, __item-chevron, __match, __loading, __empty; data-active on the active item',
};

export default doc;

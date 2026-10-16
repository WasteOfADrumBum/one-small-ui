import type { ComponentDoc } from '../site/docTypes';

const doc: ComponentDoc = {
  slug: 'tree-view',
  order: 60,
  name: 'TreeView',
  group: 'Data display',
  summary:
    'A hierarchical list following the WAI-ARIA tree view pattern: one tab stop with arrow-key navigation and typeahead, single or multiple selection, tri-state checkboxes, lazy-loaded children with loading and error rows, links that work with your router, and memoized rows that stay fast at thousands of nodes.',
  importLine: "import { TreeView, type TreeNode } from '@onesmall/ui';",
  examples: [
    {
      name: 'tree-view-basic',
      title: 'Single selection',
      description: 'Enter, Space or a click selects. Disabled nodes stay focusable so screen reader users can still find them.',
    },
    {
      name: 'tree-view-multiple',
      title: 'Multiple selection',
      description: 'Space or a click toggles, Shift + Arrow or Shift + click selects a range, and Ctrl/Cmd + A selects every visible node.',
    },
    {
      name: 'tree-view-checkboxes',
      title: 'Checkboxes',
      description: 'Checking a parent checks all its enabled descendants. A parent with some checked leaves shows a dash and reports mixed.',
    },
    {
      name: 'tree-view-lazy',
      title: 'Lazy children',
      description: 'Nodes with hasChildren load on first expand. While loading, the item is aria-busy; a failed load shows an error row, and Enter on the item (or the Retry button) tries again.',
    },
    {
      name: 'tree-view-navigation',
      title: 'Navigation with links and icons',
      description: 'Nodes with href render a link. Pass linkAs (or a node’s as or render) to use Next.js Link or another router link.',
    },
  ],
  props: [
    {
      title: 'TreeView',
      props: [
        { name: 'items', type: 'TreeNode[]', description: 'The top-level nodes. Keep the array stable (state or useMemo) in large trees.' },
        { name: 'aria-label / aria-labelledby', type: 'string', description: 'Required. Names the tree.' },
        {
          name: 'selectionMode',
          type: "'none' | 'single' | 'multiple'",
          default: "'single'",
          description: "Sets aria-selected on every item; multiple adds aria-multiselectable. 'none' is for navigation trees: Enter, Space and clicks call onAction, and parents toggle open. Ignored with checkboxes.",
        },
        { name: 'selectedKeys / defaultSelectedKeys / onSelectedKeysChange', type: 'string[]', default: '[]', description: 'Selected node ids.' },
        { name: 'expandedKeys / defaultExpandedKeys / onExpandedKeysChange', type: 'string[]', default: '[]', description: 'Open node ids. Opening a lazy node through these props also loads it.' },
        { name: 'checkboxes', type: 'boolean', description: 'Shows a tri-state checkbox per node and uses aria-checked (true, false or mixed) instead of selection.' },
        {
          name: 'checkedKeys / defaultCheckedKeys / onCheckedKeysChange',
          type: 'string[]',
          default: '[]',
          description: 'Checked leaf ids, the source of truth. Parents derive checked or mixed. A checked unloaded lazy node passes its check to the children it loads.',
        },
        { name: 'loadChildren', type: '(node) => Promise<TreeNode[]>', description: 'Fetches the children of a node with hasChildren on its first expand. Rejecting shows the error row.' },
        { name: 'onAction', type: '(node) => void', description: "Called on Enter, Space or a click in selectionMode 'none', and whenever a node's link is followed." },
        { name: 'renderLabel', type: '(node, state) => ReactNode', description: 'Custom label content. state has level, expanded, selected, checked, disabled and loading. Wrap it in useCallback.' },
        { name: 'linkAs', type: 'ElementType', default: "'a'", description: 'Link component for every node with href, such as Next.js Link.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Text size and indent. Rows stay at least 44px tall.' },
        {
          name: 'labels',
          type: 'Partial<TreeViewLabels>',
          description: 'Text for translation: loading, loaded(label, count), loadError(label), retry, retryHint, selected(count). Keep the object stable.',
        },
      ],
    },
    {
      title: 'TreeNode',
      props: [
        { name: 'id', type: 'string', description: 'Required. Unique across the tree.' },
        { name: 'label', type: 'ReactNode', description: 'Required. The visible label and the item’s accessible name.' },
        { name: 'textValue', type: 'string', description: 'Plain text for typeahead and announcements when label is not a string.' },
        { name: 'icon', type: 'ReactNode', description: 'Decorative icon before the label (hidden from screen readers).' },
        { name: 'children', type: 'TreeNode[]', description: 'Child nodes.' },
        { name: 'hasChildren', type: 'boolean', description: 'Has children that loadChildren fetches on first expand. Shows the expand chevron before they load.' },
        { name: 'disabled', type: 'boolean', description: 'Focusable and expandable but cannot be selected, checked or activated (aria-disabled). Its subtree is skipped when a parent is checked.' },
        { name: 'href', type: 'string', description: 'Renders the label as a link (tabIndex -1: the item keeps focus). Enter or a click follows it.' },
        { name: 'as', type: 'ElementType', description: 'Link component for this node. Overrides linkAs.' },
        { name: 'render', type: '(props: TreeLinkProps, node) => ReactElement', description: 'Full control of the link. Spread href, className, tabIndex and children onto it.' },
      ],
    },
  ],
  keyboard: [
    { keys: 'Tab / Shift + Tab', action: 'Moves into the tree (to the last focused node, else the first selected, else the first) and out of it. The tree is one tab stop.' },
    { keys: 'ArrowDown / ArrowUp', action: 'Next or previous visible node, without opening or closing anything.' },
    { keys: 'ArrowRight', action: 'Closed parent: opens it. Open parent: moves to its first child. Failed lazy parent: retries. Leaf: nothing. ArrowLeft in RTL.' },
    { keys: 'ArrowLeft', action: 'Open parent: closes it. Otherwise moves to the parent. ArrowRight in RTL.' },
    { keys: 'Home / End', action: 'First or last visible node.' },
    { keys: '*', action: 'Opens every sibling of the focused node.' },
    { keys: 'Type characters', action: 'Moves to the next visible node whose text starts with them (600ms buffer). Repeating one letter cycles through matches.' },
    { keys: 'Enter', action: 'Failed lazy parent: retries (and opens it if closed). Otherwise selects (single), toggles (multiple) or toggles the checkbox; follows the link of an href node; in selectionMode none calls onAction and opens or closes a parent.' },
    { keys: 'Space', action: 'Selects, toggles selection or toggles the checkbox; in selectionMode none, same as Enter.' },
    { keys: 'Shift + ArrowDown / ArrowUp', action: 'Multiple: moves focus and extends the selection range.' },
    { keys: 'Shift + Space / Shift + click', action: 'Multiple: selects from the last toggled node to this one.' },
    { keys: 'Ctrl + Shift + Home / End', action: 'Multiple: selects from the focused node to the first or last.' },
    { keys: 'Ctrl + A / Cmd + A', action: 'Multiple: selects every visible, enabled node.' },
  ],
  screenReader: [
    'Each item is a treeitem with aria-level, aria-setsize and aria-posinset, so NVDA, JAWS and VoiceOver read "Letters, collapsed, 2 of 2, level 2". aria-expanded is set only on parents.',
    'Items are named by their label only (aria-labelledby), not by the text of their subtree. Icons and the chevron are hidden.',
    'Selection uses aria-selected (with aria-multiselectable in multiple mode); checkboxes use aria-checked, with "mixed" for a partly checked parent. Never both.',
    'Lazy loading: the item and its group are aria-busy and show "Loading"; "Loading", then "Remote: 3 items", are announced politely. A failed load is announced assertively ("Couldn’t load Remote. Press Enter to retry"), and Enter or ArrowRight on the item retries. The error row\'s Retry button is for mouse and touch and is not a tab stop (tabIndex -1), so the tree stays one tab stop.',
    'Range and select-all changes announce the count ("4 items selected") through the shared announcer.',
  ],
  dos: [
    'Name the tree with aria-label or aria-labelledby.',
    'Give rich labels a textValue so typeahead and announcements have plain text.',
    'Keep items, renderLabel and labels stable (state, useMemo, useCallback) in large trees so only the rows that change re-render.',
    'Use selectionMode="none" with href nodes for a site navigation tree, or single selection to mark the current page.',
  ],
  donts: [
    "Don't put buttons, inputs or other focusable controls in labels; the item owns focus and arrow keys.",
    "Don't use a tree for a flat list or for tabular data; use ListGroup or DataTable.",
    "Don't mix checkboxes with selection; checkboxes replace selection.",
  ],
  a11y: [
    'WAI-ARIA tree view pattern: nested ul role="tree" → li role="treeitem" → ul role="group", with roving tabindex (exactly one tabIndex 0) and focus kept on the item, never on the link inside it.',
    'Rows and the expand chevron are at least 44 × 44px. The focus ring is drawn on the row (WCAG 2.4.13); selected rows also turn bold, and checked state is a tick or a dash, so neither relies on color alone. Forced colors use Highlight.',
    'Disabled nodes stay focusable with aria-disabled so they are discoverable, and are struck through.',
    'Performance: a memoized, flattened index of visible nodes drives the keyboard, and each row subscribes only to its own state, so moving focus re-renders two rows even with thousands open. There is no virtualization: every visible node stays in the DOM, so screen readers get correct set sizes and browser find works. For tens of thousands of open nodes, load children lazily.',
    'RTL: ArrowLeft and ArrowRight swap, indentation uses logical padding and the chevron mirrors. SSR safe; no drag and drop.',
  ],
  classes: `.os-tree[role="tree"][data-size][data-checkboxes]
  > li.os-tree__item[role="treeitem"][aria-expanded][aria-selected|aria-checked][aria-disabled][aria-busy]
      > .os-tree__row (--_level) > .os-tree__toggle[data-tree-toggle] + .os-tree__check + .os-tree__icon + .os-tree__label > .os-tree__link
      > ul.os-tree__group[role="group"] > li.os-tree__item · li.os-tree__status[data-error]`,
};

export default doc;

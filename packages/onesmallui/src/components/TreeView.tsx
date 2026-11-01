import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { textContent, useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useLatestRef } from '../hooks/useLatestRef';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';
import type { Size } from './types';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

/** Props a node's link receives. Spread them onto your link component. */
export interface TreeLinkProps {
  href: string;
  className: string;
  /** Always -1: the tree item owns focus, the link is only the navigation target. */
  tabIndex: -1;
  children: ReactNode;
}

export interface TreeNode {
  /** Unique across the whole tree. Used for the selected, expanded and checked keys. */
  id: string;
  label: ReactNode;
  /** Plain text for typeahead and announcements when `label` is not a string. */
  textValue?: string;
  /** Decorative icon before the label. */
  icon?: ReactNode;
  children?: TreeNode[];
  /** The node has children that `loadChildren` fetches on first expand. */
  hasChildren?: boolean;
  /** Can be focused and expanded, but not selected, checked or activated. */
  disabled?: boolean;
  /** Renders the label as a link. Enter or a click follows it and calls `onAction`. */
  href?: string;
  /** The link element for this node, such as Next.js `Link`. Overrides the tree's `linkAs`. */
  as?: ElementType;
  /** Full control of the link element. Spread the props onto it. */
  render?: (props: TreeLinkProps, node: TreeNode) => ReactElement;
}

/** What `renderLabel` gets besides the node. */
export interface TreeNodeState {
  level: number;
  expanded: boolean;
  selected: boolean;
  checked: boolean | 'mixed';
  disabled: boolean;
  loading: boolean;
}

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export interface TreeViewLabels {
  /** Shown in the loading row and announced when lazy children start loading. */
  loading: string;
  /** Announced when lazy children arrive. */
  loaded: (label: string, count: number) => string;
  /** Shown in the error row and announced (assertive) when loading fails. */
  loadError: (label: string) => string;
  /** Label of the error row's Retry button (mouse and touch; it is not a tab stop). */
  retry: string;
  /** Appended to the failure announcement, since Enter on the failed item retries. */
  retryHint: string;
  /** Announced after a range or select-all changes several nodes at once. */
  selected: (count: number) => string;
}

const defaultLabels: TreeViewLabels = {
  loading: 'Loading',
  loaded: (label, count) => (count === 1 ? `${label}: 1 item` : `${label}: ${count} items`),
  loadError: (label) => `Couldn’t load ${label}`,
  retry: 'Retry',
  retryHint: 'Press Enter to retry',
  selected: (count) => (count === 0 ? 'No items selected' : count === 1 ? '1 item selected' : `${count} items selected`),
};

export interface TreeViewProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children' | 'defaultValue' | 'onChange' | 'onSelect'> {
  items: TreeNode[];
  /**
   * Shown when `items` is empty. A string becomes the heading of a compact EmptyState; other nodes
   * render as they are. The empty tree stays in the DOM (hidden) as the ref target.
   */
  emptyState?: ReactNode;
  /** `single` (default) or `multiple` selection with `aria-selected`; `none` for navigation-only trees. Ignored with `checkboxes`. */
  selectionMode?: TreeSelectionMode;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectedKeysChange?: (keys: string[]) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedKeysChange?: (keys: string[]) => void;
  /** Shows a tri-state checkbox per node (`aria-checked`) instead of selection. */
  checkboxes?: boolean;
  /** Checked leaf keys. Parents derive checked or mixed from their leaves. */
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheckedKeysChange?: (keys: string[]) => void;
  /** Fetches the children of a node with `hasChildren` on its first expand. */
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  /** Enter, Space or a click in `selectionMode="none"`, and following any node's `href`. */
  onAction?: (node: TreeNode) => void;
  /** Custom label content. Memoize it (`useCallback`) in large trees so rows stay memoized. */
  renderLabel?: (node: TreeNode, state: TreeNodeState) => ReactNode;
  /** Link element for every node with `href`, such as Next.js `Link`. */
  linkAs?: ElementType;
  size?: Size;
  labels?: Partial<TreeViewLabels>;
}

// ---------- Store ----------
// Rows subscribe to their own slice of state (a bit mask), so a focus move re-renders
// only the two rows whose bits changed, not all of them.

const FOCUS = 1;
const SELECTED = 2;
const EXPANDED = 4;
const CHECKED = 8;
const MIXED = 16;
const LOADING = 32;
const ERROR = 64;
const LOADED = 128;

type LoadStatus = 'loading' | 'error' | 'loaded';
interface LazyState {
  status: Record<string, LoadStatus>;
  children: Record<string, TreeNode[]>;
}

interface TreeState {
  tabKey: string | null;
  selected: Set<string>;
  expanded: Set<string>;
  checks: Map<string, 'on' | 'mixed'> | null;
  lazy: LazyState;
}

class TreeStore {
  private state: TreeState;
  private listeners = new Set<() => void>();
  readonly elements = new Map<string, HTMLElement>();

  constructor(state: TreeState) {
    this.state = state;
  }
  getState = () => this.state;
  setState(state: TreeState) {
    if (state === this.state) return;
    this.state = state;
    this.listeners.forEach((l) => l());
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  bits = (id: string) => {
    const s = this.state;
    let b = 0;
    if (s.tabKey === id) b |= FOCUS;
    if (s.selected.has(id)) b |= SELECTED;
    if (s.expanded.has(id)) b |= EXPANDED;
    const c = s.checks?.get(id);
    if (c === 'on') b |= CHECKED;
    else if (c === 'mixed') b |= MIXED;
    const st = s.lazy.status[id];
    if (st === 'loading') b |= LOADING;
    else if (st === 'error') b |= ERROR;
    else if (st === 'loaded') b |= LOADED;
    return b;
  };
}

interface TreeContextValue {
  store: TreeStore;
  selectionMode: TreeSelectionMode;
  checkboxes: boolean;
  renderLabel?: TreeViewProps['renderLabel'];
  linkAs?: ElementType;
  labels: TreeViewLabels;
  load: (node: TreeNode) => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

const EMPTY: string[] = [];

const textOf = (node: TreeNode) => (node.textValue ?? textContent(node.label)).trim();
const isRtl = (el: HTMLElement) =>
  el.closest('[dir]')?.getAttribute('dir') === 'rtl' || getComputedStyle(el).direction === 'rtl';

interface IndexEntry {
  node: TreeNode;
  parentId: string | null;
  kids: TreeNode[] | undefined;
}
interface VisibleEntry {
  id: string;
  node: TreeNode;
  parentId: string | null;
  isParent: boolean;
}

const kidsOf = (node: TreeNode, lazy: LazyState) => node.children ?? lazy.children[node.id];
const hasKids = (node: TreeNode, kids: TreeNode[] | undefined) => (kids ? kids.length > 0 : !!node.hasChildren);

/** Enabled leaves under `nodes` (a disabled node disables its subtree). Unloaded lazy nodes count as leaves. */
function enabledLeaves(nodes: TreeNode[], lazy: LazyState, out: string[] = []) {
  for (const n of nodes) {
    if (n.disabled) continue;
    const kids = kidsOf(n, lazy);
    if (kids && kids.length) enabledLeaves(kids, lazy, out);
    else out.push(n.id);
  }
  return out;
}

/**
 * A hierarchical list following the WAI-ARIA tree view pattern: roving focus, arrow-key
 * navigation, typeahead, single or multiple selection, tri-state checkboxes and lazy children.
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    items,
    emptyState,
    selectionMode = 'single',
    selectedKeys,
    defaultSelectedKeys = EMPTY,
    onSelectedKeysChange,
    expandedKeys,
    defaultExpandedKeys = EMPTY,
    onExpandedKeysChange,
    checkboxes = false,
    checkedKeys,
    defaultCheckedKeys = EMPTY,
    onCheckedKeysChange,
    loadChildren,
    onAction,
    renderLabel,
    linkAs,
    size,
    labels: labelsProp,
    className,
    hidden,
    onKeyDown,
    onFocus,
    onClick,
    onMouseDown,
    ...rest
  },
  ref,
) {
  const showEmpty = items.length === 0 && emptyState != null && emptyState !== false && emptyState !== '';
  const labels = useMemo(() => ({ ...defaultLabels, ...labelsProp }), [labelsProp]);
  const { announce } = useAnnouncer();
  const [selected, setSelected] = useControllableState(selectedKeys, defaultSelectedKeys, onSelectedKeysChange);
  const [expanded, setExpanded] = useControllableState(expandedKeys, defaultExpandedKeys, onExpandedKeysChange);
  const [checked, setChecked] = useControllableState(checkedKeys, defaultCheckedKeys, onCheckedKeysChange);
  const [lazy, setLazy] = useState<LazyState>({ status: {}, children: {} });
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const mode: TreeSelectionMode = checkboxes ? 'none' : selectionMode;

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);
  const checkedSet = useMemo(() => new Set(checked), [checked]);

  // Every known node (inline and loaded children), for parent lookups and checkbox math.
  const index = useMemo(() => {
    const map = new Map<string, IndexEntry>();
    const walk = (nodes: TreeNode[], parentId: string | null) => {
      for (const node of nodes) {
        const kids = kidsOf(node, lazy);
        map.set(node.id, { node, parentId, kids });
        if (kids) walk(kids, node.id);
      }
    };
    walk(items, null);
    return map;
  }, [items, lazy]);

  // The nodes a user can reach with the arrow keys, in order.
  const visible = useMemo(() => {
    const out: VisibleEntry[] = [];
    const walk = (nodes: TreeNode[], parentId: string | null) => {
      for (const node of nodes) {
        const kids = kidsOf(node, lazy);
        const isParent = hasKids(node, kids);
        out.push({ id: node.id, node, parentId, isParent });
        if (isParent && kids && expandedSet.has(node.id)) walk(kids, node.id);
      }
    };
    walk(items, null);
    return out;
  }, [items, lazy, expandedSet]);
  const position = useMemo(() => new Map(visible.map((v, i) => [v.id, i])), [visible]);

  const checks = useMemo(() => {
    if (!checkboxes) return null;
    const map = new Map<string, 'on' | 'mixed'>();
    const walk = (node: TreeNode): 'on' | 'mixed' | 'off' => {
      const kids = kidsOf(node, lazy);
      let s: 'on' | 'mixed' | 'off';
      if (kids && kids.length) {
        const states = kids.map(walk);
        s = states.every((x) => x === 'on') ? 'on' : states.some((x) => x !== 'off') ? 'mixed' : 'off';
      } else s = checkedSet.has(node.id) ? 'on' : 'off';
      if (s !== 'off') map.set(node.id, s);
      return s;
    };
    items.forEach(walk);
    return map;
  }, [checkboxes, items, lazy, checkedSet]);

  // The one item with tabIndex 0: the last focused one, else its nearest visible ancestor,
  // else the first selected, else the first.
  let tabKey: string | null = focusedKey !== null && position.has(focusedKey) ? focusedKey : null;
  if (tabKey === null) {
    let p = focusedKey !== null ? index.get(focusedKey)?.parentId : null;
    while (p && !position.has(p)) p = index.get(p)?.parentId;
    tabKey = p ?? visible.find((v) => selectedSet.has(v.id))?.id ?? visible[0]?.id ?? null;
  }

  const state = useMemo<TreeState>(
    () => ({ tabKey, selected: selectedSet, expanded: expandedSet, checks, lazy }),
    [tabKey, selectedSet, expandedSet, checks, lazy],
  );
  const [store] = useState(() => new TreeStore(state));
  useIsomorphicLayoutEffect(() => store.setState(state), [store, state]);

  // ---------- Lazy loading ----------
  const loaderRef = useLatestRef(loadChildren);
  const announceRef = useLatestRef(announce);
  const labelsRef = useLatestRef(labels);
  const checkedRef = useLatestRef({ checked, setChecked, checkboxes });
  const inflight = useRef(new Map<string, number>());
  const seq = useRef(0);

  const load = useCallback(
    (node: TreeNode) => {
      const loader = loaderRef.current;
      if (!loader || inflight.current.has(node.id)) return;
      const token = ++seq.current;
      inflight.current.set(node.id, token);
      const l = labelsRef.current;
      setLazy((p) => ({ ...p, status: { ...p.status, [node.id]: 'loading' } }));
      announceRef.current(l.loading);
      Promise.resolve()
        .then(() => loader(node))
        .then(
          (kids) => {
            if (inflight.current.get(node.id) !== token) return;
            inflight.current.delete(node.id);
            const list = Array.isArray(kids) ? kids : [];
            setLazy((p) => ({ status: { ...p.status, [node.id]: 'loaded' }, children: { ...p.children, [node.id]: list } }));
            // A checked unloaded node passes its check down to the children it turns out to have.
            const c = checkedRef.current;
            if (c.checkboxes && list.length && c.checked.includes(node.id)) {
              const leaves = enabledLeaves(list, { status: {}, children: {} });
              c.setChecked([...c.checked.filter((k) => k !== node.id), ...leaves.filter((k) => !c.checked.includes(k))]);
            }
            announceRef.current(labelsRef.current.loaded(textOf(node), list.length));
          },
          () => {
            if (inflight.current.get(node.id) !== token) return;
            inflight.current.delete(node.id);
            setLazy((p) => ({ ...p, status: { ...p.status, [node.id]: 'error' } }));
            const l = labelsRef.current;
            announceRef.current(`${l.loadError(textOf(node))}. ${l.retryHint}`, { politeness: 'assertive' });
          },
        );
    },
    [loaderRef, labelsRef, announceRef, checkedRef],
  );

  const ctx = useMemo<TreeContextValue>(
    () => ({ store, selectionMode: mode, checkboxes, renderLabel, linkAs, labels, load }),
    [store, mode, checkboxes, renderLabel, linkAs, labels, load],
  );

  // ---------- Actions ----------
  // The range anchor: the last item toggled (Shift + click, Shift + Space), or where Shift + Arrow started.
  const anchor = useRef<{ key: string; base: string[] } | null>(null);
  const extending = useRef(false);

  const focusKey = (id: string) => {
    const el = store.elements.get(id);
    if (el?.isConnected) el.focus();
  };

  const setOpen = (ids: string[], open: boolean) => {
    if (open) {
      const add = ids.filter((id) => !expandedSet.has(id));
      if (add.length) setExpanded([...expanded, ...add]);
    } else if (ids.some((id) => expandedSet.has(id))) setExpanded(expanded.filter((k) => !ids.includes(k)));
  };

  const enabledBetween = (a: number, b: number) =>
    visible
      .slice(Math.min(a, b), Math.max(a, b) + 1)
      .filter((v) => !v.node.disabled)
      .map((v) => v.id);

  const selectRange = (from: string, to: string) => {
    if (!anchor.current) anchor.current = { key: from, base: selected };
    const a = position.get(anchor.current.key) ?? position.get(from)!;
    const range = enabledBetween(a, position.get(to)!);
    const next = [...anchor.current.base.filter((k) => !range.includes(k)), ...range];
    setSelected(next);
    announce(labels.selected(next.length));
  };

  const toggleCheck = (id: string) => {
    const entry = index.get(id);
    if (!entry) return;
    const leaves = enabledLeaves([entry.node], lazy);
    if (!leaves.length) return;
    const allOn = leaves.every((k) => checkedSet.has(k));
    setChecked(allOn ? checked.filter((k) => !leaves.includes(k)) : [...checked, ...leaves.filter((k) => !checkedSet.has(k))]);
  };

  const linkOf = (id: string) =>
    store.elements.get(id)?.querySelector<HTMLElement>(`:scope > .${cls('tree__row')} .${cls('tree__link')}`);

  const activate = (id: string, kind: 'pointer' | 'enter' | 'space', mods: { shift?: boolean; link?: boolean } = {}) => {
    const v = index.get(id);
    if (!v || v.node.disabled) return;
    const { node } = v;
    // Keyboard on a link: click it, so routers (Next.js Link) handle navigation. The click comes back as 'pointer'.
    if (kind !== 'pointer' && node.href && (kind === 'enter' || (mode === 'none' && !checkboxes))) {
      const link = linkOf(id);
      if (link) {
        link.click();
        return;
      }
    }
    // Following a link in a checkbox tree navigates without toggling the box.
    if (checkboxes) {
      if (!mods.link) toggleCheck(id);
    } else if (mode === 'single') {
      if (!selectedSet.has(id) || selected.length !== 1) setSelected([id]);
    } else if (mode === 'multiple') {
      if (mods.shift && anchor.current) selectRange(anchor.current.key, id);
      else {
        const next = selectedSet.has(id) ? selected.filter((k) => k !== id) : [...selected, id];
        setSelected(next);
        anchor.current = { key: id, base: next };
      }
    } else if (hasKids(node, v.kids) && !node.href) setOpen([id], !expandedSet.has(id));
    if (node.href || (mode === 'none' && !checkboxes)) onAction?.(node);
  };

  const retry = (id: string) => {
    const v = index.get(id);
    if (v) load(v.node);
  };

  // ---------- Events ----------
  const typeahead = useRef({ text: '', at: 0 });

  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') !== 'treeitem' || ['Shift', 'Control', 'Meta', 'Alt'].includes(e.key)) return;
    const id = target.dataset.key;
    const pos = id === undefined ? undefined : position.get(id);
    if (id === undefined || pos === undefined) return;
    const entry = visible[pos]!;
    const rtl = isRtl(e.currentTarget);
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const mod = e.ctrlKey || e.metaKey;
    const multi = mode === 'multiple';
    const status = lazy.status[id];
    let next: string | undefined;
    let handled = true;

    const extend = (to: string | undefined) => {
      if (!to) return;
      if (!extending.current) anchor.current = { key: id, base: selected };
      selectRange(id, to);
      extending.current = true;
    };
    const wasExtending = extending.current;
    extending.current = false;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      next = visible[pos + (e.key === 'ArrowDown' ? 1 : -1)]?.id;
      extending.current = wasExtending;
      if (multi && e.shiftKey) extend(next);
      else extending.current = false;
    } else if (e.key === 'Home' || e.key === 'End') {
      next = visible[e.key === 'Home' ? 0 : visible.length - 1]?.id;
      extending.current = wasExtending;
      if (multi && e.shiftKey && mod) extend(next);
      else extending.current = false;
    } else if (e.key === forward) {
      if (entry.isParent && !expandedSet.has(id)) setOpen([id], true);
      else if (status === 'error') retry(id);
      else if (entry.isParent && visible[pos + 1]?.parentId === id) next = visible[pos + 1]!.id;
    } else if (e.key === back) {
      if (entry.isParent && expandedSet.has(id)) setOpen([id], false);
      else if (entry.parentId !== null) next = entry.parentId;
    } else if (e.key === 'Enter') {
      if (status === 'error') {
        if (!expandedSet.has(id)) setOpen([id], true);
        retry(id);
      } else activate(id, 'enter');
    } else if (e.key === ' ') {
      if (multi && e.shiftKey) selectRange(anchor.current?.key ?? id, id);
      else activate(id, 'space');
    } else if (e.key === '*') {
      const siblings = entry.parentId === null ? items : (index.get(entry.parentId)?.kids ?? []);
      setOpen(
        siblings.filter((n) => hasKids(n, kidsOf(n, lazy))).map((n) => n.id),
        true,
      );
    } else if (multi && mod && !e.altKey && e.key.toLowerCase() === 'a') {
      const all = visible.filter((v) => !v.node.disabled).map((v) => v.id);
      setSelected(all);
      announce(labels.selected(all.length));
    } else if (e.key.length === 1 && /\S/.test(e.key) && !mod && !e.altKey) {
      // Typeahead, as in Menu: the next visible node whose text starts with the typed characters.
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const single = t.text.length > 1 && t.text.split('').every((c) => c === t.text[0]);
      const query = single ? t.text[0]! : t.text;
      // A repeated single letter cycles; a longer string may match the current node itself.
      const start = t.text.length > 1 && !single ? pos : pos + 1;
      const ordered = [...visible.slice(start), ...visible.slice(0, start)];
      next = ordered.find((v) => textOf(v.node).toLowerCase().startsWith(query))?.id;
      if (next === id) next = undefined;
    } else handled = false;

    if (!handled) return;
    e.preventDefault();
    if (next !== undefined && next !== id) focusKey(next);
  };

  const handleFocus = (e: FocusEvent<HTMLUListElement>) => {
    onFocus?.(e);
    const t = e.target as HTMLElement;
    if (t.getAttribute('role') === 'treeitem' && t.dataset.key !== undefined && t.dataset.key !== focusedKey) {
      setFocusedKey(t.dataset.key);
    }
  };

  // The item a pointer event belongs to: the one whose row holds the target (not an ancestor whose group does).
  const itemOf = (t: EventTarget) => {
    const el = t as HTMLElement;
    if (el.getAttribute?.('role') === 'treeitem') return el;
    const row = el.closest?.(`.${cls('tree__row')}`);
    return (row?.parentElement as HTMLElement | null | undefined) ?? null;
  };

  // Keep focus on the item (not a link inside it) and stop Shift + click selecting text.
  const handleMouseDown = (e: MouseEvent<HTMLUListElement>) => {
    onMouseDown?.(e);
    const item = itemOf(e.target);
    if (!item || e.button !== 0) return;
    e.preventDefault();
    item.focus();
  };

  const handleClick = (e: MouseEvent<HTMLUListElement>) => {
    // A router link may already have prevented the click to navigate itself; only the consumer's own
    // onClick on the tree opts out.
    const before = e.defaultPrevented;
    onClick?.(e);
    if (e.defaultPrevented && !before) return;
    const item = itemOf(e.target);
    const id = item?.dataset.key;
    if (!item || id === undefined) return;
    const v = index.get(id);
    if (!v) return;
    if (document.activeElement !== item) item.focus();
    if ((e.target as HTMLElement).closest('[data-tree-toggle]') && hasKids(v.node, v.kids)) {
      setOpen([id], !expandedSet.has(id));
      return;
    }
    activate(id, 'pointer', { shift: e.shiftKey, link: !!(e.target as HTMLElement).closest(`.${cls('tree__link')}`) });
  };

  return (
    <TreeContext.Provider value={ctx}>
      <ul
        ref={ref}
        role="tree"
        aria-multiselectable={mode === 'multiple' || undefined}
        className={cx(cls('tree'), className)}
        data-size={size}
        data-checkboxes={checkboxes || undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        // An empty tree is hidden so it isn't exposed as a tree with no items.
        hidden={showEmpty || hidden}
        {...rest}
      >
        <TreeChildren nodes={items} level={1} />
      </ul>
      {showEmpty &&
        (typeof emptyState === 'string' ? (
          <EmptyState size="compact" headingLevel={3} title={emptyState} className={cls('tree__empty-state')} />
        ) : (
          emptyState
        ))}
    </TreeContext.Provider>
  );
});

function TreeChildren({ nodes, level }: { nodes: TreeNode[]; level: number }) {
  return (
    <>
      {nodes.map((node, i) => (
        <TreeItem key={node.id} node={node} level={level} posinset={i + 1} setsize={nodes.length} />
      ))}
    </>
  );
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  posinset: number;
  setsize: number;
}

const CHECK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path className={cls('tree__tick')} d="m5 12.5 4.5 4.5L19 7.5" />
    <path className={cls('tree__dash')} d="M6 12h12" />
  </svg>
);

const TreeItem = memo(function TreeItem({ node, level, posinset, setsize }: TreeItemProps) {
  const ctx = useContext(TreeContext)!;
  const { store, selectionMode, checkboxes, renderLabel, linkAs, labels, load } = ctx;
  const id = node.id;
  const bits = useSyncExternalStore(
    store.subscribe,
    () => store.bits(id),
    () => store.bits(id),
  );
  const labelId = `os-tree-${useId().replace(/:/g, '')}`;
  const kids = node.children ?? store.getState().lazy.children[id];
  const isParent = hasKids(node, kids);
  const expanded = isParent && (bits & EXPANDED) !== 0;
  const loading = (bits & LOADING) !== 0;
  const error = (bits & ERROR) !== 0;
  const selected = (bits & SELECTED) !== 0;
  const checked: boolean | 'mixed' = bits & CHECKED ? true : bits & MIXED ? 'mixed' : false;
  const needsLoad = expanded && !node.children && !!node.hasChildren && !(bits & (LOADING | ERROR | LOADED));

  useEffect(() => {
    if (needsLoad) load(node);
  }, [needsLoad, load, node]);

  const register = useCallback(
    (el: HTMLLIElement | null) => {
      if (!el) return;
      store.elements.set(id, el);
      return () => {
        if (store.elements.get(id) === el) store.elements.delete(id);
      };
    },
    [store, id],
  );

  const disabled = !!node.disabled;
  const content = renderLabel
    ? renderLabel(node, { level, expanded, selected, checked, disabled, loading })
    : node.label;
  let label: ReactNode = content;
  if (node.href && !disabled) {
    const props: TreeLinkProps = { href: node.href, className: cls('tree__link'), tabIndex: -1, children: content };
    if (node.render) label = node.render(props, node);
    else {
      const Link = node.as ?? linkAs ?? 'a';
      label = <Link {...props} />;
    }
  }

  return (
    <li
      ref={register}
      role="treeitem"
      aria-labelledby={labelId}
      aria-level={level}
      aria-setsize={setsize}
      aria-posinset={posinset}
      aria-expanded={isParent ? expanded : undefined}
      aria-selected={selectionMode !== 'none' ? selected : undefined}
      aria-checked={checkboxes ? checked : undefined}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      tabIndex={bits & FOCUS ? 0 : -1}
      data-key={id}
      className={cls('tree__item')}
    >
      <div className={cls('tree__row')} style={{ '--_level': level } as CSSProperties}>
        <span className={cls('tree__toggle')} data-tree-toggle={isParent ? '' : undefined} aria-hidden="true">
          {isParent && <ChevronRightIcon />}
        </span>
        {checkboxes && (
          <span className={cls('tree__check')} aria-hidden="true">
            {CHECK_SVG}
          </span>
        )}
        {node.icon && (
          <span className={cls('tree__icon')} aria-hidden="true">
            {node.icon}
          </span>
        )}
        <span id={labelId} className={cls('tree__label')}>
          {label}
        </span>
      </div>
      {expanded && (
        <ul role="group" className={cls('tree__group')} aria-busy={loading || undefined}>
          {kids && <TreeChildren nodes={kids} level={level + 1} />}
          {loading && (
            <li role="none" className={cls('tree__status')} style={{ '--_level': level + 1 } as CSSProperties}>
              <Spinner size="sm" label={null} />
              <span>{labels.loading}</span>
            </li>
          )}
          {error && (
            <li role="none" className={cls('tree__status')} data-error="" style={{ '--_level': level + 1 } as CSSProperties}>
              <ErrorIcon className={cls('tree__status-icon')} />
              <span>{labels.loadError(textOf(node))}</span>
              {/* Not a tab stop: the tree stays one tab stop, and Enter on the item retries. */}
              <Button size="sm" variant="outline" color="neutral" tabIndex={-1} onClick={() => load(node)}>
                {labels.retry}
              </Button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
});

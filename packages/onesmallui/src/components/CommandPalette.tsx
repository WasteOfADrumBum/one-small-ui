import {
  Fragment,
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useHotkeys } from '../hooks/useHotkeys';
import { useLatestRef } from '../hooks/useLatestRef';
import { useMergedRefs } from '../hooks/useMergedRefs';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { cx } from '../utils/cx';
import { fuzzyFilter, fuzzyMatch } from '../utils/fuzzy';
import { parseHotkey } from '../utils/hotkeys';
import { cls } from '../utils/prefix';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { CloseButton } from './CloseButton';
import { Dialog, type DialogAnimation } from './Dialog';
import type { OverlayAppearance } from './DialogBase';
import { Kbd } from './Kbd';
import { Spinner } from './Spinner';

/** Props CommandPalette puts on each option element, for `as` and `render`. */
export interface CommandItemRenderProps {
  id: string;
  role: 'option';
  'aria-selected': boolean;
  'aria-disabled'?: boolean;
  'aria-label': string;
  'aria-describedby'?: string;
  className: string;
  'data-active'?: boolean;
  tabIndex: -1;
  href?: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onMouseMove: () => void;
  children: ReactNode;
}

export interface CommandItem {
  /** Unique within the palette. Also what `recent` stores. */
  id: string;
  /** The visible text, matched by the search and used as the option's accessible name. */
  label: string;
  /** Extra words that also match (aliases, synonyms). Not shown. */
  keywords?: readonly string[];
  /** Decorative icon. */
  icon?: ReactNode;
  /** A combo such as `'Mod+S'`, shown with Kbd. Display only: bind it yourself with useHotkeys. */
  shortcut?: string;
  description?: ReactNode;
  /** Shown but skipped by the arrow keys and not selectable. */
  disabled?: boolean;
  /** Heading to group under, when you pass a flat `items` list. */
  group?: string;
  /** Makes the option a link. Selecting it follows the link. */
  href?: string;
  /** Element type for the option, such as Next.js `Link`. Defaults to `a` with `href`, else `div`. */
  as?: ElementType;
  /** Full control over the option element: spread the props onto your link or element. */
  render?: (props: CommandItemRenderProps) => ReactElement;
  /** Called when the item is chosen. */
  onSelect?: (item: CommandItem) => void;
  /** Turns the item into a nested page that lists these items. */
  children?: CommandItem[];
  /** Placeholder of the input while this item's page is open. */
  placeholder?: string;
}

export interface CommandGroup {
  /** Stable key. Defaults to the heading or the index. */
  id?: string;
  /** Visible heading that names the group. Omit for an unlabelled run of items. */
  heading?: string;
  items: CommandItem[];
}

export interface CommandPaletteLabels {
  /** First breadcrumb, for the top-level list. */
  root: string;
  /** Names the breadcrumb navigation. */
  breadcrumb: string;
  /** Names the listbox. */
  listbox: string;
  close: string;
  loading: string;
  /** Shown and announced when `loadItems` rejects. */
  error: string;
  /** Announced after filtering. */
  results: (count: number) => string;
}

const defaultLabels: CommandPaletteLabels = {
  root: 'Home',
  breadcrumb: 'Command pages',
  listbox: 'Results',
  close: 'Close command palette',
  loading: 'Loading results',
  error: 'Results could not be loaded.',
  results: (n) => (n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`),
};

export interface CommandPaletteRecent {
  /** localStorage key. */
  storageKey: string;
  /** How many to keep. Default 5. */
  max?: number;
  /** Group heading. Default `'Recent'`. */
  label?: string;
}

export interface CommandItemState {
  active: boolean;
  query: string;
  /** The label with matched characters wrapped in `<mark>`. */
  label: ReactNode;
}

export interface CommandPaletteProps
  extends Omit<HTMLAttributes<HTMLDialogElement>, 'title' | 'children' | 'onSelect' | 'defaultValue'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Opens and closes the palette from anywhere. Default `'Mod+K'`; `false` turns it off. */
  hotkey?: string | string[] | false;
  /** A flat list. Items with the same `group` are listed under one heading. */
  items?: CommandItem[];
  /** Grouped data, as an alternative to `items`. */
  groups?: CommandGroup[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  /** Accessible name of the dialog. */
  label?: string;
  /** Accessible name of the search input. */
  inputLabel?: string;
  /** Shown when nothing matches. */
  emptyState?: ReactNode | ((query: string) => ReactNode);
  /** Opt in to a "Recent" group, stored in localStorage. */
  recent?: CommandPaletteRecent;
  /** Load results for a query (top level only). Shown after the static items; stale requests are aborted. */
  loadItems?: (query: string, options: { signal: AbortSignal }) => Promise<CommandGroup[]>;
  /** Milliseconds to wait after typing before `loadItems` runs. Default 200. */
  debounce?: number;
  /**
   * Replaces the built-in fuzzy search: return `false` (or a number ≤ 0) to hide an item,
   * `true` to keep it, or a score to rank it. `false` turns local filtering off.
   */
  filter?: ((item: CommandItem, query: string) => boolean | number) | false;
  /** Custom content inside each option. The option element and its accessible name stay the same. */
  renderItem?: (item: CommandItem, state: CommandItemState) => ReactNode;
  /** Called for every chosen item, after the item's own `onSelect`. */
  onSelect?: (item: CommandItem) => void;
  /** Close after an item is chosen. Default `true`. */
  closeOnSelect?: boolean;
  labels?: Partial<CommandPaletteLabels>;
  appearance?: OverlayAppearance;
  animation?: DialogAnimation;
}

interface Entry {
  key: string;
  item: CommandItem;
  indices: number[];
  optionId: string;
}

interface Section {
  key: string;
  heading?: string;
  entries: Entry[];
}

/** Clusters a flat list by `group`, in order of first appearance. */
function toGroups(items: CommandItem[]): CommandGroup[] {
  const out: CommandGroup[] = [];
  const byName = new Map<string | undefined, CommandGroup>();
  for (const item of items) {
    let g = byName.get(item.group);
    if (!g) {
      g = { heading: item.group, items: [] };
      byName.set(item.group, g);
      out.push(g);
    }
    g.items.push(item);
  }
  return out;
}

function collect(items: CommandItem[] | undefined, groups: CommandGroup[] | undefined, map = new Map<string, CommandItem>()) {
  const walk = (list: CommandItem[]) => {
    for (const item of list) {
      if (!map.has(item.id)) map.set(item.id, item);
      if (item.children) walk(item.children);
    }
  };
  walk(items ?? []);
  for (const g of groups ?? []) walk(g.items);
  return map;
}

/** Wraps the matched characters of `text` in `<mark>`. */
function highlightMatches(text: string, indices: readonly number[]): ReactNode {
  if (!indices.length) return text;
  const set = new Set(indices);
  const out: ReactNode[] = [];
  let run = '';
  let marked = false;
  const flush = (i: number) => {
    if (!run) return;
    out.push(marked ? <mark key={i} className={cls('command-palette__match')}>{run}</mark> : run);
    run = '';
  };
  for (let i = 0; i < text.length; i++) {
    const m = set.has(i);
    if (m !== marked) {
      flush(i);
      marked = m;
    }
    run += text[i];
  }
  flush(text.length);
  return out;
}

function readRecent(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * A search-first command menu in a modal dialog, opened with Mod+K. It is an ARIA 1.2
 * combobox with a listbox (`aria-activedescendant`, so focus stays in the input), with
 * fuzzy search, grouped results, nested pages, recent items and async loading.
 * The ref is the search input.
 */
export const CommandPalette = forwardRef<HTMLInputElement, CommandPaletteProps>(function CommandPalette(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    hotkey = 'Mod+K',
    items,
    groups,
    query: queryProp,
    defaultQuery = '',
    onQueryChange,
    placeholder = 'Type a command or search…',
    label = 'Command palette',
    inputLabel = 'Search commands',
    emptyState,
    recent,
    loadItems,
    debounce = 200,
    filter,
    renderItem,
    onSelect,
    closeOnSelect = true,
    labels: labelsProp,
    appearance,
    animation = 'scale',
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp };
  const base = `os-cmdk-${useId().replace(/:/g, '')}`;
  const listId = `${base}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMergedRefs(inputRef, ref);
  const { announce } = useAnnouncer();

  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useControllableState(queryProp, defaultQuery, onQueryChange);
  const [stack, setStack] = useState<CommandItem[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<CommandGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  // A chosen item closes the dialog at once, so focus can follow wherever the action goes.
  const [instant, setInstant] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setInstant(false);
  }
  const openRef = useLatestRef(open);
  const loadRef = useLatestRef(loadItems);
  const remembered = useRef(new Map<string, CommandItem>());

  const close = (now = false) => {
    if (now) setInstant(true);
    setOpen(false);
  };

  // ---------- Hotkey ----------
  const combos = hotkey === false ? [] : Array.isArray(hotkey) ? hotkey : [hotkey];
  // Combos with a modifier also work while typing in a field; bare keys such as "/" don't.
  const allowInInputs = combos.every((c) => {
    const p = parseHotkey(c);
    return p.mod || p.ctrl || p.meta || p.alt;
  });
  useHotkeys(combos, () => setOpen(!openRef.current), { enabled: combos.length > 0, allowInInputs });

  // ---------- Reset on close ----------
  useEffect(() => {
    if (open) return;
    setStack([]);
    setActiveKey(null);
    if (query) setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the palette closes
  }, [open]);

  // ---------- Recent ----------
  const recentKey = recent?.storageKey;
  useEffect(() => {
    if (!open || !recentKey) return;
    setRecentIds(readRecent(recentKey));
  }, [open, recentKey]);

  const remember = (item: CommandItem) => {
    if (!recent) return;
    remembered.current.set(item.id, item);
    const next = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, recent.max ?? 5);
    setRecentIds(next);
    try {
      window.localStorage.setItem(recent.storageKey, JSON.stringify(next));
    } catch {
      // Storage full or blocked: recent items just aren't kept.
    }
  };

  // ---------- Async ----------
  const page = stack[stack.length - 1];
  const atRoot = !page;
  const q = query.trim();
  const hasLoader = !!loadItems;
  useEffect(() => {
    if (!open || !hasLoader || !atRoot) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const load = loadRef.current;
      if (!load) return;
      load(q, { signal: controller.signal }).then(
        (result) => {
          if (controller.signal.aborted) return;
          setLoaded(result);
          setLoading(false);
        },
        () => {
          if (controller.signal.aborted) return;
          setLoaded([]);
          setError(true);
          setLoading(false);
        },
      );
    }, debounce);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, hasLoader, atRoot, q, debounce, loadRef]);

  // ---------- Results ----------
  const sections = useMemo<Section[]>(() => {
    const source = page ? toGroups(page.children ?? []) : groups ? groups : toGroups(items ?? []);
    const highlight = (item: CommandItem) => (q ? (fuzzyMatch(q, item.label)?.indices ?? []) : []);
    const ranked: { key: string; heading?: string; best: number; results: { item: CommandItem; indices: number[] }[] }[] = [];
    source.forEach((g, gi) => {
      const key = `g${gi}`;
      let results: { item: CommandItem; indices: number[]; score: number }[];
      if (!q || filter === false) results = g.items.map((item) => ({ item, indices: highlight(item), score: 0 }));
      else if (filter) {
        results = g.items
          .map((item, order) => {
            const r = filter(item, q);
            const score = r === true ? 1 : r === false ? 0 : r;
            return { item, indices: highlight(item), score, order };
          })
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score || a.order - b.order);
      } else {
        results = fuzzyFilter(g.items, q, { getText: (i) => i.label, getKeywords: (i) => i.keywords });
      }
      if (results.length) ranked.push({ key, heading: g.heading, best: Math.max(...results.map((r) => r.score)), results });
    });
    // Best-matching group first; ties keep the given order.
    if (q && filter !== false) ranked.sort((a, b) => b.best - a.best);
    if (atRoot) {
      loaded.forEach((g, gi) => {
        if (g.items.length) ranked.push({ key: `a${gi}`, heading: g.heading, best: 0, results: g.items.map((item) => ({ item, indices: highlight(item) })) });
      });
    }
    if (atRoot && !q && recent && recentIds.length) {
      const all = collect(items, groups, new Map(remembered.current));
      const found = recentIds.map((id) => all.get(id)).filter((x): x is CommandItem => !!x);
      if (found.length) ranked.unshift({ key: 'recent', heading: recent.label ?? 'Recent', best: 0, results: found.map((item) => ({ item, indices: [] })) });
    }
    let n = 0;
    return ranked.map((g) => ({
      key: g.key,
      heading: g.heading,
      entries: g.results.map(({ item, indices }) => ({ key: `${g.key}:${item.id}`, item, indices, optionId: `${base}-o${n++}` })),
    }));
  }, [page, groups, items, q, filter, atRoot, loaded, recent, recentIds, base]);

  const entries = useMemo(() => sections.flatMap((s) => s.entries), [sections]);
  const enabled = entries.filter((e) => !e.item.disabled);
  const activeEntry =
    enabled.find((e) => e.key === activeKey) ?? enabled.find((e) => e.item.id === activeKey) ?? enabled[0];
  const listShown = open && (entries.length > 0 || loading);

  useEffect(() => {
    if (!open || !activeEntry) return;
    document.getElementById(activeEntry.optionId)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeEntry]);

  // ---------- Announce the result count (debounced, after a query or page change) ----------
  const announceKey = `${q}\u0000${stack.length}`;
  const lastKey = useRef<string | null>(null);
  const pending = useRef<'query' | 'page' | null>(null);
  const count = entries.length;
  useEffect(() => {
    if (!open) {
      lastKey.current = null;
      pending.current = null;
      return;
    }
    if (lastKey.current === null) lastKey.current = announceKey;
    else if (lastKey.current !== announceKey) {
      const pageChanged = lastKey.current.split('\u0000')[1] !== String(stack.length);
      lastKey.current = announceKey;
      pending.current = pageChanged || pending.current === 'page' ? 'page' : 'query';
    }
    if (!pending.current || loading) return;
    const timer = setTimeout(() => {
      const kind = pending.current;
      pending.current = null;
      if (error) {
        announce(labels.error, { politeness: 'assertive' });
        return;
      }
      const msg = labels.results(count);
      announce(kind === 'page' ? `${page?.label ?? labels.root}. ${msg}` : msg);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- announce when the result settles
  }, [open, announceKey, count, loading, error]);

  // ---------- Navigation ----------
  const goTo = (depth: number) => {
    if (depth >= stack.length) return;
    const leaving = stack[depth];
    setStack(stack.slice(0, depth));
    setQuery('');
    setActiveKey(leaving?.id ?? null);
  };
  const back = () => goTo(stack.length - 1);

  const choose = (entry: Entry, e: MouseEvent<HTMLElement>) => {
    const { item } = entry;
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (item.children) {
      e.preventDefault();
      setStack([...stack, item]);
      setQuery('');
      setActiveKey(null);
      inputRef.current?.focus();
      return;
    }
    item.onSelect?.(item);
    onSelect?.(item);
    remember(item);
    // Modified clicks open links in a new tab or window: keep the palette open.
    const newTab = !!item.href && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1);
    if (closeOnSelect && !newTab) close(true);
  };

  const move = (to: 'next' | 'prev' | 'first' | 'last') => {
    const len = enabled.length;
    if (!len) return;
    const i = activeEntry ? enabled.indexOf(activeEntry) : -1;
    const next =
      to === 'first' ? 0 : to === 'last' ? len - 1 : to === 'next' ? (i < 0 ? 0 : (i + 1) % len) : i < 0 ? len - 1 : (i - 1 + len) % len;
    setActiveKey(enabled[next]!.key);
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const plain = !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        move(e.key === 'ArrowDown' ? 'next' : 'prev');
        break;
      case 'Home':
      case 'End':
        if (!plain) return;
        e.preventDefault();
        move(e.key === 'Home' ? 'first' : 'last');
        break;
      case 'Enter':
        if (!activeEntry) return;
        e.preventDefault();
        // A real click, so links (and router links such as Next.js Link) navigate as usual.
        document.getElementById(activeEntry.optionId)?.click();
        break;
      case 'Backspace':
        if (!query && stack.length) {
          e.preventDefault();
          back();
        }
        break;
    }
  };

  const onDialogKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.key !== 'Escape') return;
    // Handled here, so the browser's own cancel doesn't also close the dialog.
    e.preventDefault();
    if (stack.length) back();
    else close();
  };

  // ---------- Render ----------
  const renderOption = (entry: Entry) => {
    const { item, optionId } = entry;
    const active = entry === activeEntry;
    const descId = item.description ? `${optionId}-desc` : undefined;
    const kbdId = item.shortcut ? `${optionId}-kbd` : undefined;
    const highlighted = highlightMatches(item.label, entry.indices);
    const content = renderItem ? (
      renderItem(item, { active, query: q, label: highlighted })
    ) : (
      <>
        {item.icon && (
          <span className={cls('command-palette__item-icon')} aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className={cls('command-palette__item-text')}>
          <span className={cls('command-palette__item-label')}>{highlighted}</span>
          {item.description && (
            <span id={descId} className={cls('command-palette__item-description')}>
              {item.description}
            </span>
          )}
        </span>
        {item.shortcut && <Kbd id={kbdId} combo={item.shortcut} size="sm" className={cls('command-palette__item-shortcut')} />}
        {item.children && <ChevronRightIcon className={cls('command-palette__item-chevron')} />}
      </>
    );
    const props: CommandItemRenderProps = {
      id: optionId,
      role: 'option',
      'aria-selected': active,
      'aria-disabled': item.disabled || undefined,
      // The plain label: highlight marks split the visible text, never the accessible name.
      'aria-label': item.label,
      'aria-describedby': [descId, kbdId].filter(Boolean).join(' ') || undefined,
      className: cls('command-palette__item'),
      'data-active': active || undefined,
      // Focus stays on the input (aria-activedescendant); -1 only makes the option programmatically focusable.
      tabIndex: -1,
      href: item.disabled ? undefined : item.href,
      onClick: (e) => choose(entry, e),
      onMouseDown: (e) => e.preventDefault(),
      onMouseMove: () => {
        if (!item.disabled && !active) setActiveKey(entry.key);
      },
      children: content,
    };
    if (item.render) return <Fragment key={entry.key}>{item.render(props)}</Fragment>;
    const Comp: ElementType = item.as ?? (props.href ? 'a' : 'div');
    return <Comp key={entry.key} {...props} />;
  };

  const empty = typeof emptyState === 'function' ? emptyState(q) : (emptyState ?? (q ? `No results for “${q}”` : 'Nothing here yet'));

  return (
    <Dialog
      open={open}
      onClose={() => close()}
      title={null}
      aria-label={label}
      hideCloseButton
      fullscreen="sm"
      animation={instant ? 'none' : animation}
      appearance={appearance}
      initialFocus={inputRef}
      className={cx(cls('command-palette'), className)}
      onKeyDown={onDialogKey}
      {...rest}
    >
      {stack.length > 0 && (
        <Breadcrumb aria-label={labels.breadcrumb} className={cls('command-palette__breadcrumb')}>
          {[{ id: '', label: labels.root }, ...stack].map((crumb, depth) =>
            depth === stack.length ? (
              <BreadcrumbItem key={depth} current>
                {crumb.label}
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem key={depth}>
                <button
                  type="button"
                  className={cls('command-palette__crumb')}
                  onClick={() => {
                    goTo(depth);
                    inputRef.current?.focus();
                  }}
                >
                  {crumb.label}
                </button>
              </BreadcrumbItem>
            ),
          )}
        </Breadcrumb>
      )}
      <div className={cls('command-palette__search')}>
        <SearchIcon className={cls('command-palette__search-icon')} />
        <input
          ref={setInputRef}
          type="text"
          role="combobox"
          className={cls('command-palette__input')}
          aria-label={inputLabel}
          aria-expanded={listShown}
          aria-controls={listShown ? listId : undefined}
          aria-activedescendant={listShown && activeEntry ? activeEntry.optionId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={page?.placeholder ?? placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveKey(null);
          }}
          onKeyDown={onInputKey}
        />
        <CloseButton label={labels.close} onClick={() => close()} className={cls('command-palette__close')} />
      </div>
      <div className={cls('command-palette__results')}>
        {loading && (
          <div className={cls('command-palette__loading')}>
            <Spinner size="sm" label={null} color="current" />
            <span>{labels.loading}</span>
          </div>
        )}
        {listShown && (
          <div id={listId} role="listbox" aria-label={labels.listbox} aria-busy={loading || undefined} className={cls('command-palette__list')}>
            {sections.map((s) =>
              s.heading ? (
                <div key={s.key} role="group" aria-labelledby={`${base}-${s.key}`} className={cls('command-palette__group')}>
                  <div id={`${base}-${s.key}`} role="presentation" className={cls('command-palette__heading')}>
                    {s.heading}
                  </div>
                  {s.entries.map(renderOption)}
                </div>
              ) : (
                <Fragment key={s.key}>{s.entries.map(renderOption)}</Fragment>
              ),
            )}
          </div>
        )}
        {open && !loading && entries.length === 0 && (
          <div className={cls('command-palette__empty')}>{error ? labels.error : empty}</div>
        )}
      </div>
    </Dialog>
  );
});

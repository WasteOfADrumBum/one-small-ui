import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { Chip, chipKeyNav } from './Chip';
import type { ComboboxOption } from './Combobox';
import { useFieldContext, useFieldControl } from './Field';
import { focusControlOnPress } from './Input';
import type { Color, ExtendedSize, Placement } from './types';

/** Every text TagInput reads to screen readers or shows inline. Override any of them to translate. */
export interface TagInputMessages {
  /** Accessible name of a chip's remove button. */
  removeLabel: (tag: string) => string;
  added: (tags: string[]) => string;
  removed: (tag: string) => string;
  /** Read when an add fills the last free slot, and when an add is refused because the list is full. */
  limitReached: (max: number) => string;
  duplicate: (tag: string) => string;
  /** Used when `validate` returns `false` instead of a message. */
  invalid: (tag: string) => string;
  /** `mode="suggestions-only"`: the typed text matches no suggestion. */
  notInSuggestions: (text: string) => string;
  /** Read while typing when suggestions are shown. */
  results: (count: number) => string;
}

const defaultMessages: TagInputMessages = {
  removeLabel: (t) => `Remove tag: ${t}`,
  added: (t) => (t.length === 1 ? `Added tag: ${t[0]}.` : `Added ${t.length} tags: ${t.join(', ')}.`),
  removed: (t) => `Removed tag: ${t}.`,
  limitReached: (max) => `Tag limit reached: ${max} of ${max}.`,
  duplicate: (t) => `${t} is already added.`,
  invalid: (t) => `"${t}" is not a valid tag.`,
  notInSuggestions: (t) => `"${t}" is not in the list. Choose a suggestion.`,
  results: (n) => (n === 0 ? 'No suggestions.' : n === 1 ? '1 suggestion available.' : `${n} suggestions available.`),
};

export interface TagInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'defaultValue' | 'onChange' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'id'> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Keys that commit the typed text as a tag. `'Enter'` and other key names match `event.key`;
   * single characters also split pasted text. Newlines always split pastes. Default `['Enter', ',']`.
   */
  delimiters?: string[];
  /** `free` (default) accepts any text; `suggestions-only` accepts only values from `suggestions`. */
  mode?: 'free' | 'suggestions-only';
  /** Options listed under the input as the user types. Turns the input into a combobox. */
  suggestions?: string[] | ComboboxOption[];
  /** Custom suggestion matcher. Default: case-insensitive "label contains text". */
  filter?: (option: ComboboxOption, text: string) => boolean;
  /** `'case-insensitive'` (default) treats "Design" and "design" as the same tag; `true` dedupes exact matches only; `false` allows duplicates. */
  dedupe?: boolean | 'case-insensitive';
  /** Maximum number of tags. */
  maxTags?: number;
  /** Return `true` to accept a tag, or an error message (or `false`) to reject it. */
  validate?: (tag: string, tags: string[]) => boolean | string;
  /** Shown in the list when nothing matches in `suggestions-only` mode. */
  emptyMessage?: ReactNode;
  /** Called with the text typed into the input (for async suggestions). */
  onInputChange?: (text: string) => void;
  placeholder?: string;
  /** Form field name. Each tag is submitted as its own hidden input. */
  name?: string;
  size?: ExtendedSize;
  /** Chip color. */
  color?: Color;
  disabled?: boolean;
  /** Shows the tags without remove buttons and refuses adds and removes. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  placement?: ResponsiveValue<Placement>;
  /** Id of the text input. Field sets it. */
  id?: string;
  autoFocus?: boolean;
  /** Accessible name for the text input when not inside a `Field`. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  messages?: Partial<TagInputMessages>;
}

const toOptions = (s: string[] | ComboboxOption[] | undefined): ComboboxOption[] =>
  (s ?? []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

const escapeClass = (s: string) => s.replace(/[\\\]^-]/g, '\\$&');

type Notice = { text: string; kind: 'error' | 'info' };

/**
 * A text input that turns entries into tags (chips). Enter or a comma adds the typed text,
 * pasted lists are split, Backspace in the empty input removes the last tag, and the arrow
 * keys move between tags (Delete or Backspace removes the focused one). With `suggestions`
 * the input becomes a combobox with a filtered listbox; `mode="suggestions-only"` accepts
 * nothing else. Each tag submits as its own hidden input named `name`.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    value,
    defaultValue,
    onValueChange,
    delimiters = ['Enter', ','],
    mode = 'free',
    suggestions,
    filter,
    dedupe = 'case-insensitive',
    maxTags,
    validate,
    emptyMessage = 'No matching suggestions',
    onInputChange,
    placeholder,
    name,
    size,
    color,
    disabled,
    readOnly,
    required,
    invalid,
    placement = 'bottom-start',
    id,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    messages: messageOverrides,
    className,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const { announce } = useAnnouncer();
  const msg = { ...defaultMessages, ...messageOverrides };
  const initial = useRef(defaultValue ?? []);
  const [tags, setTags] = useControllableState<string[]>(value, initial.current, onValueChange);
  const [draft, setDraftRaw] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef<number | null>(null);
  const auto = `os-tagin-${useId().replace(/:/g, '')}`;
  const listId = `${auto}-list`;
  const noticeId = `${auto}-notice`;

  const options = useMemo(() => toOptions(suggestions), [suggestions]);
  const hasSuggestions = suggestions !== undefined;
  const { anchorRef, floatingRef } = useFloating<HTMLDivElement, HTMLDivElement>({ open, placement, matchWidth: true, offset: 6 });

  const controlProps = useFieldControl({
    id,
    disabled,
    required,
    readOnly,
    'aria-describedby': [ariaDescribedBy, notice ? noticeId : undefined].filter(Boolean).join(' ') || undefined,
  });
  const isDisabled = !!controlProps.disabled;
  const isReadOnly = !!(controlProps as { readOnly?: boolean }).readOnly;
  const isRequired = !!controlProps.required;
  const isInvalid = !!invalid || !!field?.invalid || notice?.kind === 'error';
  const locked = isDisabled || isReadOnly;
  const full = maxTags !== undefined && tags.length >= maxTags;

  const keyOf = (t: string) => (dedupe === 'case-insensitive' ? t.toLocaleLowerCase() : t);
  const has = (list: string[], t: string) => dedupe !== false && list.some((x) => keyOf(x) === keyOf(t));
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const labelOf = (t: string) => byValue.get(t)?.label ?? t;

  // Suggestions: filtered by the draft, without tags already added.
  const visible = useMemo(() => {
    const q = draft.trim().toLocaleLowerCase();
    const added = new Set(tags.map((t) => (dedupe === 'case-insensitive' ? t.toLocaleLowerCase() : t)));
    return options.filter((o) => {
      if (added.has(dedupe === 'case-insensitive' ? o.value.toLocaleLowerCase() : o.value)) return false;
      if (!q) return true;
      return filter ? filter(o, draft.trim()) : o.label.toLocaleLowerCase().includes(q);
    });
  }, [options, tags, draft, filter, dedupe]);
  const enabled = visible.filter((o) => !o.disabled);
  const activeOption = active >= 0 ? enabled[active] : undefined;
  const listShown = hasSuggestions && open && !locked && (visible.length > 0 || mode === 'suggestions-only');
  const optionId = (o: ComboboxOption) => `${auto}-opt-${options.indexOf(o)}`;

  const charDelimiters = delimiters.filter((d) => d.length === 1);
  const splitPattern = new RegExp(`[${['\n', '\r', ...charDelimiters].map(escapeClass).join('')}]`);
  const joiner = charDelimiters[0] ? `${charDelimiters[0]} ` : ' ';

  const setDraft = (text: string) => {
    setDraftRaw(text);
    onInputChange?.(text);
  };

  const show = (n: Notice | null) => {
    setNotice(n);
    if (n) announce(n.text, { politeness: n.kind === 'error' ? 'assertive' : 'polite' });
  };

  useLayoutEffect(() => {
    const el = floatingRef.current;
    if (!el) return;
    if (listShown) showInTopLayer(el);
    else hideFromTopLayer(el);
  }, [listShown, floatingRef]);

  useEffect(() => {
    if (!listShown || !activeOption) return;
    document.getElementById(optionId(activeOption))?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from activeOption
  }, [listShown, activeOption]);

  // After a remove, focus the remove button that slid into its place, else the input.
  useEffect(() => {
    const i = pendingFocus.current;
    if (i === null) return;
    pendingFocus.current = null;
    const root = rootRef.current;
    // Keep focus that already landed inside (chip arrow-key removal moves it itself).
    if (!root || root.contains(document.activeElement)) return;
    const buttons = root.querySelectorAll<HTMLElement>(`.${cls('chip__remove')}`);
    (buttons[i] ?? inputRef.current)?.focus();
  }, [tags]);

  // Form reset restores the initial tags.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setTags(initial.current);
      setDraftRaw('');
      setNotice(null);
    };
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [setTags]);

  /** Resolves typed text to a tag value: a matching suggestion's value, the text itself, or null in suggestions-only mode. */
  const resolve = (text: string): string | null => {
    const lower = text.toLocaleLowerCase();
    const match = options.find((o) => !o.disabled && (o.label.toLocaleLowerCase() === lower || o.value.toLocaleLowerCase() === lower));
    if (match) return match.value;
    return mode === 'suggestions-only' ? null : text;
  };

  /** Adds entries in order. Returns the entries that were refused, to keep in the input. */
  const commit = (raw: string[], fromOption = false): string[] => {
    if (locked) return raw;
    let next = tags;
    const added: string[] = [];
    const leftover: string[] = [];
    let problem: Notice | null = null;
    let limitHit = false;
    for (const r of raw) {
      const text = r.trim();
      if (!text) continue;
      if (maxTags !== undefined && next.length >= maxTags) {
        limitHit = true;
        leftover.push(text);
        continue;
      }
      const tag = fromOption ? text : resolve(text);
      if (tag === null) {
        problem ??= { text: msg.notInSuggestions(text), kind: 'error' };
        leftover.push(text);
        continue;
      }
      if (has(next, tag)) {
        const existing = next.find((x) => keyOf(x) === keyOf(tag)) ?? tag;
        problem ??= { text: msg.duplicate(labelOf(existing)), kind: 'info' };
        continue;
      }
      const ok = validate ? validate(tag, next) : true;
      if (ok !== true) {
        problem ??= { text: typeof ok === 'string' ? ok : msg.invalid(tag), kind: 'error' };
        leftover.push(text);
        continue;
      }
      next = [...next, tag];
      added.push(tag);
    }
    if (added.length) {
      setTags(next);
      const filled = maxTags !== undefined && next.length >= maxTags;
      announce([msg.added(added.map(labelOf)), filled && !problem ? msg.limitReached(maxTags) : ''].filter(Boolean).join(' '));
    }
    if (problem) show(problem);
    else if (limitHit) show({ text: msg.limitReached(maxTags!), kind: 'info' });
    else setNotice(null);
    return leftover;
  };

  const removeAt = (i: number) => {
    if (locked) return;
    const t = tags[i]!;
    setTags(tags.filter((_, j) => j !== i));
    setNotice(null);
    announce(msg.removed(labelOf(t)));
  };

  const closeList = () => {
    setOpen(false);
    setActive(-1);
  };

  const commitDraft = () => {
    const left = commit([draft]);
    setDraft(left.join(joiner));
    closeList();
  };

  const pick = (o: ComboboxOption) => {
    if (o.disabled) return;
    commit([o.value], true);
    setDraft('');
    closeList();
  };

  const openList = (to: 'first' | 'last' | 'none') => {
    if (!hasSuggestions || locked) return;
    setOpen(true);
    setActive(to === 'first' ? (enabled.length ? 0 : -1) : to === 'last' ? enabled.length - 1 : -1);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (listShown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.key === 'ArrowUp' && e.altKey) closeList();
        else
          setActive((i) =>
            e.key === 'ArrowDown' ? Math.min(i + 1, enabled.length - 1) : i <= 0 ? enabled.length - 1 : i - 1,
          );
        return;
      }
      if (e.key === 'Enter' && activeOption) {
        e.preventDefault();
        pick(activeOption);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeList();
        return;
      }
      if (e.key === 'Tab') closeList();
    } else if (hasSuggestions && e.key === 'ArrowDown') {
      e.preventDefault();
      openList(e.altKey ? 'none' : 'first');
      return;
    } else if (hasSuggestions && e.key === 'ArrowUp') {
      e.preventDefault();
      openList('last');
      return;
    } else if (e.key === 'Escape' && draft) {
      e.preventDefault();
      setDraft('');
      setNotice(null);
      return;
    }

    if (delimiters.includes(e.key) && !e.nativeEvent.isComposing) {
      if (!draft.trim()) {
        // An empty Enter still submits the form; other delimiters are swallowed.
        if (e.key !== 'Enter') e.preventDefault();
        return;
      }
      e.preventDefault();
      commitDraft();
      return;
    }
    if (locked) return;
    if (e.key === 'Backspace' && !draft && input.selectionStart === 0 && input.selectionEnd === 0 && tags.length) {
      e.preventDefault();
      removeAt(tags.length - 1);
      return;
    }
    const rtl = getComputedStyle(input).direction === 'rtl';
    const towardTags = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === towardTags && input.selectionStart === 0 && input.selectionEnd === 0 && tags.length) {
      const buttons = rootRef.current?.querySelectorAll<HTMLElement>(`.${cls('chip__remove')}:not(:disabled)`);
      const last = buttons?.[buttons.length - 1];
      if (last) {
        e.preventDefault();
        closeList();
        last.focus();
      }
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (locked) return;
    const text = e.clipboardData.getData('text');
    if (!splitPattern.test(text)) return;
    e.preventDefault();
    const el = e.currentTarget;
    const before = draft.slice(0, el.selectionStart ?? draft.length);
    const after = draft.slice(el.selectionEnd ?? draft.length);
    const left = commit(`${before}${text}${after}`.split(splitPattern));
    setDraft(left.join(joiner));
    closeList();
  };

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
    closeList();
    if (!draft.trim() || locked) return;
    // Free text is kept as a tag on blur; in suggestions-only mode only an exact match is.
    if (mode === 'suggestions-only' && resolve(draft.trim()) === null) return;
    commitDraft();
  };

  const placeholderText = full ? undefined : (placeholder ?? (field?.layout === 'floating' ? ' ' : undefined));

  const comboboxProps = hasSuggestions
    ? {
        role: 'combobox' as const,
        'aria-autocomplete': 'list' as const,
        'aria-expanded': listShown,
        'aria-controls': listId,
        'aria-haspopup': 'listbox' as const,
        'aria-activedescendant': listShown && activeOption ? optionId(activeOption) : undefined,
      }
    : {};

  const groups: { name?: string; items: ComboboxOption[] }[] = [];
  for (const o of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === o.group) last.items.push(o);
    else groups.push({ name: o.group, items: [o] });
  }

  const renderOption = (o: ComboboxOption) => (
    <div
      key={o.value}
      id={optionId(o)}
      role="option"
      aria-selected={activeOption === o}
      aria-disabled={o.disabled || undefined}
      className={cls('combobox__option')}
      data-active={activeOption === o || undefined}
      // Focus stays on the input (aria-activedescendant); -1 only makes the option programmatically focusable.
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => pick(o)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick(o);
        }
      }}
      onMouseMove={() => {
        if (o.disabled) return;
        const i = enabled.indexOf(o);
        if (i !== active) setActive(i);
      }}
    >
      {o.icon && (
        <span className={cls('combobox__icon')} aria-hidden="true">
          {o.icon}
        </span>
      )}
      <span className={cls('combobox__text')}>
        <span className={cls('combobox__label')}>{o.label}</span>
        {o.description && <span className={cls('combobox__description')}>{o.description}</span>}
      </span>
    </div>
  );

  const seen = new Map<string, number>();

  return (
    <div
      ref={rootRef}
      className={cx(cls('tag-input'), className)}
      data-size={size ?? 'md'}
      data-state={hasSuggestions ? (listShown ? 'open' : 'closed') : undefined}
      data-invalid={isInvalid || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-full={full || undefined}
      {...rest}
    >
      {/* Presentation: a styling wrapper. Its mousedown forwards focus to the input; arrow keys and Delete bubble up from the chip buttons inside. */}
      <div
        ref={anchorRef}
        role="presentation"
        className={cls('tag-input__control')}
        onMouseDown={(e) => {
          focusControlOnPress(e, `.${cls('tag-input__input')}`);
          if (mode === 'suggestions-only' && !listShown && e.target === e.currentTarget) openList('none');
        }}
        onKeyDown={(e) => {
          if (e.target === inputRef.current) return;
          chipKeyNav(e, () => inputRef.current?.focus());
        }}
      >
        {tags.map((t, i) => {
          const n = (seen.get(t) ?? 0) + 1;
          seen.set(t, n);
          const label = labelOf(t);
          return (
            <Chip
              key={`${t}\u0000${n}`}
              color={color}
              size={size === 'lg' ? 'md' : 'sm'}
              disabled={isDisabled}
              removeLabel={msg.removeLabel(label)}
              onRemove={
                isReadOnly
                  ? undefined
                  : () => {
                      pendingFocus.current = i;
                      removeAt(i);
                    }
              }
            >
              {label}
            </Chip>
          );
        })}
        <input
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          type="text"
          className={cls('tag-input__input')}
          autoComplete="off"
          enterKeyHint="enter"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- opt-in prop, passed through as on a native input
          autoFocus={autoFocus}
          aria-label={field ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...comboboxProps}
          {...controlProps}
          // Required only while there are no tags, so native validation passes once one is added.
          required={isRequired && tags.length === 0 ? true : undefined}
          aria-required={isRequired && tags.length > 0 ? true : undefined}
          aria-invalid={isInvalid || undefined}
          placeholder={placeholderText}
          value={draft}
          onChange={(e) => {
            const text = e.target.value;
            if (notice) setNotice(null);
            // Mobile keyboards often type delimiters without a usable keydown: split here too.
            if (charDelimiters.length && !locked && splitPattern.test(text)) {
              const parts = text.split(splitPattern);
              const tail = parts.pop() ?? '';
              const left = commit(parts);
              setDraft([...left, tail].filter(Boolean).join(joiner));
              closeList();
              return;
            }
            setDraft(text);
            if (hasSuggestions && !locked) {
              setOpen(true);
              const q = text.trim().toLocaleLowerCase();
              const count = options.filter(
                (o) => !has(tags, o.value) && (!q || (filter ? filter(o, text.trim()) : o.label.toLocaleLowerCase().includes(q))),
              );
              setActive(mode === 'suggestions-only' && q && count.some((o) => !o.disabled) ? 0 : -1);
              if (q) announce(msg.results(count.length));
            }
          }}
          onKeyDown={onInputKeyDown}
          onPaste={onPaste}
          onBlur={onBlur}
        />
      </div>
      {hasSuggestions && (
        <div ref={floatingRef} className={cx(cls('floating'), cls('combobox__popup'), cls('tag-input__popup'))} hidden={!listShown}>
          <div
            id={listId}
            role="listbox"
            aria-labelledby={field?.labelId ?? ariaLabelledBy}
            aria-label={field || ariaLabelledBy ? undefined : ariaLabel}
            className={cls('combobox__listbox')}
          >
            {groups.map((g, gi) =>
              g.name ? (
                <div key={`${g.name}-${gi}`} role="group" aria-labelledby={`${auto}-g${gi}`} className={cls('combobox__group')}>
                  <div id={`${auto}-g${gi}`} role="presentation" className={cls('combobox__group-label')}>
                    {g.name}
                  </div>
                  {g.items.map(renderOption)}
                </div>
              ) : (
                g.items.map(renderOption)
              ),
            )}
          </div>
          {visible.length === 0 && <div className={cls('combobox__empty')}>{emptyMessage}</div>}
        </div>
      )}
      {notice && (
        <p id={noticeId} className={cls('tag-input__notice')} data-kind={notice.kind}>
          {notice.text}
        </p>
      )}
      {name && tags.map((t, i) => <input key={`h-${t}-${i}`} type="hidden" name={name} value={t} disabled={isDisabled || undefined} />)}
    </div>
  );
});

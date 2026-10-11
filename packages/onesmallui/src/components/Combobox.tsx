import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { Chip } from './Chip';
import { useFieldContext, useFieldControl } from './Field';
import { useInputGroupSize } from './InputGroup';
import type { ExtendedSize, Placement } from './types';

export interface ComboboxOption {
  value: string;
  /** Text shown in the list and in the input, and matched when filtering. */
  label: string;
  description?: ReactNode;
  /** Decorative icon. */
  icon?: ReactNode;
  /** Options with the same group are listed under one heading. */
  group?: string;
  disabled?: boolean;
}

interface ComboboxBaseProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'children'> {
  options: ComboboxOption[];
  /** Type to filter (default). `false` makes it a select-only combobox. */
  searchable?: boolean;
  /** Custom matcher. Default: case-insensitive "label contains query". */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Shown when nothing matches. */
  emptyMessage?: ReactNode;
  /** Announced when filtering: `(count) => string`. */
  resultsMessage?: (count: number) => string;
  size?: ExtendedSize;
  placement?: ResponsiveValue<Placement>;
  invalid?: boolean;
  /** Called with the text typed into the input. */
  onInputChange?: (query: string) => void;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const toArray = (v: string | string[] | null | undefined): string[] | undefined =>
  v === undefined ? undefined : v === null ? [] : Array.isArray(v) ? v : [v];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/**
 * A custom select with live search, following the WAI-ARIA combobox pattern with a
 * listbox popup (`aria-activedescendant`, so focus stays in the input). Supports
 * single or multiple selection, groups, icons and descriptions, and submits with
 * forms through hidden inputs named `name`.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(props, ref) {
  const {
    options,
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    searchable = true,
    filter,
    emptyMessage = 'No matches',
    resultsMessage = (n: number) => (n === 1 ? '1 result available.' : `${n} results available.`),
    size,
    placement = 'bottom-start',
    invalid,
    onInputChange,
    placeholder,
    name,
    className,
    style,
    onKeyDown,
    onBlur,
    ...rest
  } = props;
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const auto = `os-cbx-${useId().replace(/:/g, '')}`;
  const listId = `${auto}-list`;
  const [selected, setSelectedRaw] = useControllableState<string[]>(
    toArray(value as string | string[] | null | undefined),
    toArray(defaultValue as string | string[] | null | undefined) ?? [],
    (next) => (onValueChange as ((v: unknown) => void) | undefined)?.(multiple ? next : (next[0] ?? null)),
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { anchorRef, floatingRef } = useFloating<HTMLDivElement, HTMLDivElement>({ open, placement, matchWidth: true, offset: 6 });

  const controlProps = useFieldControl({ ...rest, required: rest.required });
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const disabled = controlProps.disabled;

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const visible = useMemo(() => {
    if (!searchable || !typing || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => (filter ? filter(o, query) : o.label.toLowerCase().includes(q)));
  }, [options, searchable, typing, query, filter]);
  const enabled = visible.filter((o) => !o.disabled);
  const activeOption = active >= 0 ? enabled[active] : undefined;
  const optionId = (v: string) => `${auto}-opt-${options.findIndex((o) => o.value === v)}`;

  const singleLabel = !multiple && selected[0] !== undefined ? (byValue.get(selected[0])?.label ?? '') : '';
  const inputValue = typing ? query : multiple ? '' : singleLabel;

  useLayoutEffect(() => {
    const el = floatingRef.current;
    if (!el) return;
    if (open) showInTopLayer(el);
    else hideFromTopLayer(el);
  }, [open, floatingRef]);

  useEffect(() => {
    if (!open || !activeOption) return;
    document.getElementById(optionId(activeOption.value))?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeOption]);

  const openList = (to: 'selected' | 'first' | 'last' | 'none' = 'selected') => {
    if (disabled) return;
    setOpen(true);
    const list = enabled;
    if (to === 'first') setActive(list.length ? 0 : -1);
    else if (to === 'last') setActive(list.length - 1);
    else if (to === 'none') setActive(-1);
    else {
      const i = list.findIndex((o) => selected.includes(o.value));
      setActive(i >= 0 ? i : list.length ? 0 : -1);
    }
  };

  const close = () => {
    setOpen(false);
    setTyping(false);
    setQuery('');
    setActive(-1);
  };

  const choose = (o: ComboboxOption) => {
    if (o.disabled) return;
    if (multiple) {
      setSelectedRaw(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value]);
      setQuery('');
      setTyping(false);
      setActive(options.filter((x) => !x.disabled).findIndex((x) => x.value === o.value));
    } else {
      setSelectedRaw([o.value]);
      close();
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList(e.altKey ? 'none' : 'selected');
        else setActive((i) => Math.min(i + 1, enabled.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList('last');
        else if (e.altKey) close();
        else setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
      case 'End':
        if (open && !searchable) {
          e.preventDefault();
          setActive(e.key === 'Home' ? 0 : enabled.length - 1);
        }
        break;
      case 'PageDown':
      case 'PageUp':
        if (open) {
          e.preventDefault();
          setActive((i) => (e.key === 'PageDown' ? Math.min(i + 10, enabled.length - 1) : Math.max(i - 10, 0)));
        }
        break;
      case 'Enter':
        if (open && activeOption) {
          e.preventDefault();
          choose(activeOption);
        }
        break;
      case ' ':
        if (!searchable) {
          e.preventDefault();
          if (!open) openList();
          else if (activeOption) choose(activeOption);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        } else if (typing || query) {
          setQuery('');
          setTyping(false);
        }
        break;
      case 'Backspace':
        if (multiple && !query && selected.length) setSelectedRaw(selected.slice(0, -1));
        break;
      case 'Tab':
        if (open) close();
        break;
    }
  };

  const groups: { name?: string; items: ComboboxOption[] }[] = [];
  for (const o of visible) {
    const last = groups[groups.length - 1];
    if (last && last.name === o.group) last.items.push(o);
    else groups.push({ name: o.group, items: [o] });
  }

  const renderOption = (o: ComboboxOption) => {
    const isSel = selected.includes(o.value);
    const isActive = activeOption?.value === o.value;
    return (
      <div
        key={o.value}
        id={optionId(o.value)}
        role="option"
        aria-selected={isSel}
        aria-disabled={o.disabled || undefined}
        className={cls('combobox__option')}
        data-active={isActive || undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(o)}
        onMouseMove={() => {
          if (o.disabled) return;
          const i = enabled.indexOf(o);
          if (i !== active) setActive(i);
        }}
      >
        <span className={cls('combobox__check')} aria-hidden="true">
          {isSel && <CheckIcon />}
        </span>
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
  };

  return (
    <div
      className={cx(cls('combobox'), className)}
      style={style}
      data-size={size ?? groupSize ?? 'md'}
      data-state={open ? 'open' : 'closed'}
      data-multiple={multiple || undefined}
      data-invalid={isInvalid || undefined}
      data-valid={(!isInvalid && field?.valid) || undefined}
      data-disabled={disabled || undefined}
    >
      <div
        ref={anchorRef}
        className={cls('combobox__control')}
        onMouseDown={(e) => {
          if (disabled || (e.target as HTMLElement).closest(`.${cls('chip')}`)) return;
          if (e.target !== inputRef.current) e.preventDefault();
          inputRef.current?.focus();
          if (open) close();
          else openList();
        }}
      >
        {multiple &&
          selected.map((v) => (
            <Chip key={v} size="sm" disabled={disabled} onRemove={() => setSelectedRaw(selected.filter((x) => x !== v))}>
              {byValue.get(v)?.label ?? v}
            </Chip>
          ))}
        <input
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          type="text"
          role="combobox"
          className={cls('combobox__input')}
          aria-autocomplete={searchable ? 'list' : 'none'}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          autoComplete="off"
          {...controlProps}
          required={multiple ? undefined : controlProps.required}
          aria-required={multiple && controlProps.required ? true : undefined}
          aria-invalid={isInvalid || undefined}
          aria-activedescendant={open && activeOption ? optionId(activeOption.value) : undefined}
          readOnly={!searchable || controlProps.readOnly}
          placeholder={multiple && selected.length ? undefined : (placeholder ?? (field?.layout === 'floating' ? ' ' : undefined))}
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setTyping(true);
            onInputChange?.(e.target.value);
            if (!open) setOpen(true);
            setActive(e.target.value ? 0 : -1);
          }}
          onKeyDown={onKey}
          onBlur={(e) => {
            close();
            onBlur?.(e);
          }}
        />
        <span className={cls('combobox__chevron')} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
      <div ref={floatingRef} className={cx(cls('floating'), cls('combobox__popup'))} hidden={!open}>
        <div id={listId} role="listbox" aria-multiselectable={multiple || undefined} aria-labelledby={field?.labelId} aria-label={field ? undefined : rest['aria-label']} className={cls('combobox__listbox')}>
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
      <span className={cls('sr-only')} aria-live="polite">
        {open && typing ? resultsMessage(visible.length) : ''}
      </span>
      {name &&
        (multiple ? (
          selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)
        ) : (
          <input type="hidden" name={name} value={selected[0] ?? ''} />
        ))}
    </div>
  );
});

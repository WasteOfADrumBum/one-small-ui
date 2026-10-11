import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import { focusControlOnPress } from './Input';
import type { Color, Size } from './types';

const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

interface ChipGroupContextValue {
  selected?: string[];
  toggle?: (value: string) => void;
  size?: Size;
  color?: Color;
  variant?: ChipVariant;
  disabled?: boolean;
}
const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);

export type ChipVariant = 'soft' | 'solid' | 'outline';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  children: ReactNode;
  /** Value used by a selectable `ChipGroup`. Defaults to the text of `children` when it is a string. */
  value?: string;
  color?: Color;
  variant?: ChipVariant;
  size?: Size;
  /** Decorative icon before the text. */
  icon?: ReactNode;
  /** An `Avatar` (or image) before the text. */
  avatar?: ReactNode;
  /** Makes the chip a toggle button (`aria-pressed`). */
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Shows a remove button. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Default: "Remove <text>". */
  removeLabel?: string;
  disabled?: boolean;
}

const textOf = (n: ReactNode): string => (typeof n === 'string' || typeof n === 'number' ? String(n) : '');

/**
 * A compact tag. Static by default; becomes a toggle button with `selected` /
 * `onSelectedChange` (or inside a selectable `ChipGroup`), and dismissible with `onRemove`.
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    children,
    value,
    color,
    variant,
    size,
    icon,
    avatar,
    selected,
    onSelectedChange,
    onRemove,
    removeLabel,
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const group = useContext(ChipGroupContext);
  const v = value ?? textOf(children);
  const inGroupSelection = !!group?.toggle;
  const isSelected = inGroupSelection ? group!.selected!.includes(v) : selected;
  const toggleable = inGroupSelection || selected !== undefined || !!onSelectedChange;
  const isDisabled = disabled ?? group?.disabled;

  const content = (
    <>
      {toggleable && (
        <span className={cls('chip__check')}>
          <CheckIcon />
        </span>
      )}
      {avatar && <span className={cls('chip__avatar')}>{avatar}</span>}
      {icon && (
        <span className={cls('chip__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={cls('chip__label')}>{children}</span>
    </>
  );

  return (
    <span
      ref={ref}
      className={cx(cls('chip'), className)}
      data-color={color ?? group?.color}
      data-variant={variant ?? group?.variant ?? 'soft'}
      data-size={size ?? group?.size ?? 'md'}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-removable={onRemove ? true : undefined}
      {...rest}
    >
      {toggleable ? (
        <button
          type="button"
          className={cls('chip__main')}
          aria-pressed={!!isSelected}
          disabled={isDisabled}
          onClick={() => {
            if (inGroupSelection) group!.toggle!(v);
            onSelectedChange?.(!isSelected);
          }}
        >
          {content}
        </button>
      ) : (
        <span className={cls('chip__main')}>{content}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className={cls('chip__remove')}
          aria-label={removeLabel ?? `Remove ${textOf(children) || v}`}
          disabled={isDisabled}
          onClick={onRemove}
        >
          <RemoveIcon />
        </button>
      )}
    </span>
  );
});

export interface ChipGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'defaultValue'> {
  /** Makes chips toggle buttons. `single` allows at most one pressed chip. */
  selectionMode?: 'none' | 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  size?: Size;
  color?: Color;
  variant?: ChipVariant;
  disabled?: boolean;
}

/**
 * Lays chips out in a wrapping row. Arrow keys move focus between chips, Home/End jump
 * to the ends, and Delete or Backspace removes the focused chip when it is dismissible.
 * Give it an `aria-label` so the group is announced.
 */
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
  { selectionMode = 'none', value, defaultValue = [], onValueChange, size, color, variant, disabled, className, onKeyDown, children, ...rest },
  ref,
) {
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue, onValueChange);
  const toggle =
    selectionMode === 'none'
      ? undefined
      : (v: string) => {
          if (selectionMode === 'single') setSelected(selected.includes(v) ? [] : [v]);
          else setSelected(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
        };
  return (
    <ChipGroupContext.Provider value={{ selected, toggle, size, color, variant, disabled }}>
      <div
        ref={ref}
        role="group"
        className={cx(cls('chip-group'), className)}
        onKeyDown={(e) => {
          chipKeyNav(e);
          onKeyDown?.(e);
        }}
        {...rest}
      >
        {children}
      </div>
    </ChipGroupContext.Provider>
  );
});

/** Roving arrow-key focus and Delete/Backspace removal across chip buttons in a container. */
function chipKeyNav(e: KeyboardEvent<HTMLElement>, onLeaveEnd?: () => void): boolean {
  const target = e.target as HTMLElement;
  if (!target.matches(`.${cls('chip__main')}, .${cls('chip__remove')}`)) return false;
  const items = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>(`button.${cls('chip__main')}:not(:disabled), .${cls('chip__remove')}:not(:disabled)`),
  );
  const i = items.indexOf(target);
  const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
  const next = rtl ? 'ArrowLeft' : 'ArrowRight';
  const prev = rtl ? 'ArrowRight' : 'ArrowLeft';
  if (e.key === next || e.key === 'ArrowDown') {
    e.preventDefault();
    if (i === items.length - 1 && onLeaveEnd) onLeaveEnd();
    else items[Math.min(i + 1, items.length - 1)]?.focus();
  } else if (e.key === prev || e.key === 'ArrowUp') {
    e.preventDefault();
    items[Math.max(i - 1, 0)]?.focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    items[0]?.focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    items[items.length - 1]?.focus();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    const remove = target.closest(`.${cls('chip')}`)?.querySelector<HTMLButtonElement>(`.${cls('chip__remove')}`);
    if (!remove || remove.disabled) return false;
    e.preventDefault();
    // Move focus to a neighbour before the chip disappears.
    const neighbours = items.filter((el) => !remove.closest(`.${cls('chip')}`)!.contains(el));
    const after = items.slice(i + 1).find((el) => neighbours.includes(el));
    const before = items.slice(0, i).reverse().find((el) => neighbours.includes(el));
    remove.click();
    if (after) after.focus();
    else if (onLeaveEnd) onLeaveEnd();
    else before?.focus();
  } else return false;
  return true;
}

// ---------- ChipInput ----------

export interface ChipInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'defaultValue' | 'onChange'> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Characters that commit the typed text as a chip, besides Enter. Default `[',']`. */
  separators?: string[];
  /** Maximum number of chips. */
  max?: number;
  allowDuplicates?: boolean;
  /** Return false (or an error string) to reject a value. */
  validate?: (value: string) => boolean | string;
  placeholder?: string;
  /** Form field name. Each chip is submitted as its own hidden input. */
  name?: string;
  size?: Size;
  color?: Color;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  /** Accessible name for the text input when not inside a `Field`. */
  'aria-label'?: string;
  /** Text announced after adding and removing chips. */
  messages?: { added?: (v: string) => string; removed?: (v: string) => string };
}

/**
 * A text input that turns entries into chips. Type and press Enter or a comma to add,
 * paste a comma-separated list to add many, Backspace in the empty input removes the
 * last chip, and arrow keys move between chips (Delete removes the focused one).
 */
export const ChipInput = forwardRef<HTMLInputElement, ChipInputProps>(function ChipInput(
  {
    value,
    defaultValue = [],
    onValueChange,
    separators = [','],
    max,
    allowDuplicates,
    validate,
    placeholder,
    name,
    size,
    color,
    disabled,
    invalid,
    id,
    'aria-label': ariaLabel,
    messages,
    className,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const [chips, setChips] = useControllableState<string[]>(value, defaultValue, onValueChange);
  const [draft, setDraft] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [rejection, setRejection] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auto = `os-chipin-${useId().replace(/:/g, '')}`;
  const controlProps = useFieldControl({ id, disabled, 'aria-describedby': rejection ? `${auto}-reject` : undefined });
  const isDisabled = controlProps.disabled;
  const isInvalid = invalid || !!field?.invalid || !!rejection;
  const full = max !== undefined && chips.length >= max;

  const add = (raw: string[]) => {
    let next = chips;
    const added: string[] = [];
    for (const r of raw) {
      const v = r.trim();
      if (!v) continue;
      if (max !== undefined && next.length >= max) break;
      if (!allowDuplicates && next.includes(v)) continue;
      const ok = validate ? validate(v) : true;
      if (ok !== true) {
        setRejection(typeof ok === 'string' ? ok : `"${v}" is not valid.`);
        return false;
      }
      next = [...next, v];
      added.push(v);
    }
    setRejection('');
    if (added.length) {
      setChips(next);
      setAnnouncement(added.map((a) => messages?.added?.(a) ?? `Added ${a}.`).join(' '));
    }
    return true;
  };

  const removeAt = (i: number) => {
    const v = chips[i]!;
    setChips(chips.filter((_, j) => j !== i));
    setAnnouncement(messages?.removed?.(v) ?? `Removed ${v}.`);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || separators.includes(e.key)) {
      if (!draft.trim()) {
        if (e.key !== 'Enter') e.preventDefault();
        return;
      }
      e.preventDefault();
      if (add([draft])) setDraft('');
    } else if (e.key === 'Backspace' && !draft && chips.length) {
      e.preventDefault();
      removeAt(chips.length - 1);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && e.currentTarget.selectionStart === 0 && chips.length) {
      const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
      if (rtl && e.key === 'ArrowLeft') return;
      e.preventDefault();
      const buttons = e.currentTarget.parentElement!.querySelectorAll<HTMLElement>(`.${cls('chip__remove')}`);
      buttons[buttons.length - 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const pattern = new RegExp(`[${['\n', ...separators].map((s) => s.replace(/[\\\]^-]/g, '\\$&')).join('')}]`);
    if (!pattern.test(text)) return;
    e.preventDefault();
    add(text.split(pattern));
  };

  return (
    <div
      className={cx(cls('chip-input'), className)}
      data-size={size ?? 'md'}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      onMouseDown={(e) => focusControlOnPress(e, `.${cls('chip-input__control')}`)}
      onKeyDown={(e) => {
        if (e.target === inputRef.current) return;
        chipKeyNav(e, () => inputRef.current?.focus());
      }}
      {...rest}
    >
      {chips.map((c, i) => (
        <Chip
          key={`${c}-${i}`}
          color={color}
          size={size === 'lg' ? 'md' : 'sm'}
          disabled={isDisabled}
          onRemove={() => {
            removeAt(i);
            if (i === chips.length - 1) inputRef.current?.focus();
          }}
        >
          {c}
        </Chip>
      ))}
      <input
        ref={(el) => {
          inputRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={cls('chip-input__control')}
        aria-label={field ? undefined : ariaLabel}
        {...controlProps}
        aria-invalid={isInvalid || undefined}
        placeholder={full ? undefined : placeholder}
        readOnly={full || undefined}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (rejection) setRejection('');
        }}
        onKeyDown={onInputKeyDown}
        onPaste={onPaste}
        onBlur={() => {
          if (draft.trim() && add([draft])) setDraft('');
        }}
        enterKeyHint="enter"
      />
      {name && chips.map((c, i) => <input key={`h-${c}-${i}`} type="hidden" name={name} value={c} />)}
      <span className={cls('sr-only')} aria-live="polite">
        {announcement}
      </span>
      {rejection && (
        <span id={`${auto}-reject`} className={cls('chip-input__error')} role="alert">
          {rejection}
        </span>
      )}
    </div>
  );
});

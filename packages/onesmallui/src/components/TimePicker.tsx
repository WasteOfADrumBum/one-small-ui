import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { CheckIcon } from '../icons/CheckIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { useFieldContext } from './Field';
import { Input } from './Input';
import type { ExtendedSize, Placement } from './types';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

// ---------- Pure helpers (no DOM; safe on the server and in a future DateTimePicker) ----------

/** `h12`: 1–12 with a day period (9:30 PM). `h23`: 0–23 (21:30). */
export type HourCycle = 'h12' | 'h23';

const MINUTES_PER_DAY = 24 * 60;
const pad = (n: number) => String(n).padStart(2, '0');

/** Minutes since midnight for an `HH:mm` string (`"09:30"` → 570). `NaN` when it isn't one. */
export function timeToMinutes(value: string): number {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

/** `HH:mm` for minutes since midnight (`570` → `"09:30"`). Wraps around the day, so `1440` is `"00:00"`. */
export function minutesToTime(minutes: number): string {
  const n = ((Math.floor(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
}

/**
 * Reads what people type into an `HH:mm` string, or `null`. Accepts `9`, `930`, `0930`,
 * `9:30`, `9.30`, `9h30`, `21:30`, `09:30:15` (seconds dropped) and a trailing day period:
 * `9p`, `9:30pm`, `9.30 p.m.`. With a day period the hour is 1–12 (`12am` is `00:00`,
 * `12pm` is `12:00`); without, 0–23. `24:00` and out-of-range parts are rejected.
 */
export function parseTime(text: string): string | null {
  let s = text.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!s) return null;
  let period: 'am' | 'pm' | null = null;
  const p = /\s?([ap])\.?(?:\s?m\.?)?$/.exec(s);
  if (p) {
    period = p[1] === 'a' ? 'am' : 'pm';
    s = s.slice(0, p.index).trim();
  }
  let h: number;
  let min: number;
  const sep = /^(\d{1,2})\s?[:.h]\s?(\d{2})(?:[:.](\d{2}))?$/.exec(s);
  if (sep) {
    h = Number(sep[1]);
    min = Number(sep[2]);
    if (sep[3] !== undefined && Number(sep[3]) > 59) return null;
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = Number(s);
      min = 0;
    } else {
      h = Number(s.slice(0, -2));
      min = Number(s.slice(-2));
    }
  } else {
    return null;
  }
  if (min > 59) return null;
  if (period) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (period === 'pm' ? 12 : 0);
  } else if (h > 23) {
    return null;
  }
  return `${pad(h)}:${pad(min)}`;
}

/**
 * The hour cycle a locale uses, from `Intl.DateTimeFormat#resolvedOptions`. Deterministic for
 * a given locale and runtime, with no DOM access. `h11` counts as `h12` and `h24` as `h23`.
 */
export function getHourCycle(locale?: string): HourCycle {
  try {
    const o = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    if (o.hourCycle) return o.hourCycle === 'h11' || o.hourCycle === 'h12' ? 'h12' : 'h23';
    return o.hour12 ? 'h12' : 'h23';
  } catch {
    return 'h23';
  }
}

export interface FormatTimeOptions {
  locale?: string;
  /** Default: the locale's own (see `getHourCycle`). */
  hourCycle?: HourCycle;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(locale: string | undefined, hourCycle: HourCycle) {
  const key = `${locale ?? ''}|${hourCycle}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, {
      hour: hourCycle === 'h23' ? '2-digit' : 'numeric',
      minute: '2-digit',
      hourCycle,
      timeZone: 'UTC',
    });
    formatters.set(key, f);
  }
  return f;
}

/**
 * Formats an `HH:mm` value for display with `Intl.DateTimeFormat` (`"21:30"` →
 * `"9:30 PM"` in `en-US`, `"21:30"` with `hourCycle: 'h23'`). Returns `''` for an invalid
 * value. Narrow and no-break spaces become plain spaces, so the text is easy to retype.
 */
export function formatTime(value: string, { locale, hourCycle }: FormatTimeOptions = {}): string {
  const n = timeToMinutes(value);
  if (Number.isNaN(n)) return '';
  let f: Intl.DateTimeFormat;
  try {
    f = formatterFor(locale, hourCycle ?? getHourCycle(locale));
  } catch {
    return value;
  }
  return f.format(new Date(Date.UTC(2000, 0, 1, Math.floor(n / 60), n % 60))).replace(/[\u00a0\u202f]/g, ' ');
}

export interface TimeOptionsConfig {
  /** Minutes between options. Default 15. */
  step?: number;
  /** First time, `HH:mm`. Default `00:00`. The steps count from here. */
  min?: string;
  /** Last time, `HH:mm`. Default `23:59`. */
  max?: string;
}

/** The `HH:mm` times from `min` to `max` (inclusive) every `step` minutes. Empty when `min` is after `max`. */
export function getTimeOptions({ step = 15, min, max }: TimeOptionsConfig = {}): string[] {
  const s = Number.isFinite(step) && step > 0 ? step : 15;
  const lo = min !== undefined && !Number.isNaN(timeToMinutes(min)) ? timeToMinutes(min) : 0;
  const hi = max !== undefined && !Number.isNaN(timeToMinutes(max)) ? timeToMinutes(max) : MINUTES_PER_DAY - 1;
  const out: string[] = [];
  for (let n = lo; n <= hi; n += s) out.push(minutesToTime(n));
  return out;
}

/** Matches text against every displayed label (for locales whose day periods `parseTime` can't read). */
function parseByLabel(text: string, opts: FormatTimeOptions): string | null {
  const want = text.toLowerCase().replace(/\s+/g, '');
  for (let n = 0; n < MINUTES_PER_DAY; n++) {
    const v = minutesToTime(n);
    if (formatTime(v, opts).toLowerCase().replace(/\s+/g, '') === want) return v;
  }
  return null;
}

// ---------- Component ----------

export interface TimePickerMessages {
  /** Announced and set as the validation message when typed text isn't a time. */
  invalid?: string;
  /** When the typed time is before `min` or after `max`. */
  outOfRange?: string;
  /** When `isTimeDisabled` rejects the typed time. */
  unavailable?: string;
}

export interface TimePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'children' | 'type'
  > {
  /** `HH:mm`, 24-hour, whatever the display. `null` for no time. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Minutes between listed times. Default 15. Typed times between steps are still accepted. */
  step?: number;
  /** Earliest time, `HH:mm`. The list starts here. */
  min?: string;
  /** Latest time, `HH:mm`. */
  max?: string;
  /** Disable specific times (listed but not selectable; typed ones are rejected). */
  isTimeDisabled?: (value: string) => boolean;
  /** Display clock. Default: the locale's own (`en-US` 12-hour, `en-GB` 24-hour). */
  hourCycle?: HourCycle;
  /** Locale for display. Default: the runtime's. */
  locale?: string;
  /** Form field name. The value is submitted as `HH:mm` through a hidden input. */
  name?: string;
  placement?: ResponsiveValue<Placement>;
  /** `dark` forces the dark theme on the list; `translucent` frosts it. */
  appearance?: 'default' | 'dark' | 'translucent';
  size?: ExtendedSize;
  invalid?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the clock button. Default "Choose time" / "Change time, 9:30 AM". */
  toggleLabel?: string;
  /** Accessible name of the list when there's no `Field` label. Default "Times". */
  listLabel?: string;
  messages?: TimePickerMessages;
}

/**
 * A time field: type a time (`9`, `930`, `9:30p`, `21:30`) or pick one from a list at
 * `step` intervals. Follows the WAI-ARIA combobox pattern with a listbox popup
 * (`aria-activedescendant`, so focus stays in the input). The value is always `HH:mm`.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    step = 15,
    min,
    max,
    isTimeDisabled,
    hourCycle: hourCycleProp,
    locale,
    name,
    placement = 'bottom-start',
    appearance = 'default',
    size,
    invalid,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    toggleLabel,
    listLabel = 'Times',
    messages,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    placeholder,
    className,
    style,
    onKeyDown,
    onBlur,
    onClick,
    ...rest
  } = props;
  const field = useFieldContext();
  const { announce } = useAnnouncer();
  const auto = `os-tp-${useId().replace(/:/g, '')}`;
  const listId = `${auto}-list`;
  const optionId = (v: string) => `${auto}-opt-${v.replace(':', '')}`;

  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue ?? null, onValueChange);
  const [open, setOpenRaw] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [navigated, setNavigated] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const centerOnOpen = useRef(false);
  const hadError = useRef(false);
  const { anchorRef, floatingRef } = useFloating<HTMLDivElement, HTMLDivElement>({ open, placement, matchWidth: true, offset: 6 });

  const disabled = disabledProp ?? field?.disabled ?? false;
  const readOnly = readOnlyProp ?? field?.readOnly ?? false;
  const hourCycle = useMemo(() => hourCycleProp ?? getHourCycle(locale), [hourCycleProp, locale]);
  const fmtOpts = useMemo(() => ({ locale, hourCycle }), [locale, hourCycle]);
  const fmt = (v: string) => formatTime(v, fmtOpts);

  const options = useMemo(
    () => getTimeOptions({ step, min, max }).map((v) => ({ value: v, label: formatTime(v, fmtOpts), disabled: !!isTimeDisabled?.(v) })),
    [step, min, max, isTimeDisabled, fmtOpts],
  );
  const enabled = useMemo(() => options.filter((o) => !o.disabled), [options]);

  const display = current ? fmt(current) : '';
  const inputValue = draft ?? display;
  const minN = min !== undefined && !Number.isNaN(timeToMinutes(min)) ? timeToMinutes(min) : 0;
  const maxN = max !== undefined && !Number.isNaN(timeToMinutes(max)) ? timeToMinutes(max) : MINUTES_PER_DAY - 1;

  /** The enabled option closest to `target` minutes (ties go to the earlier one). */
  const nearest = (target: number) => {
    let best: string | null = null;
    let dist = Infinity;
    for (const o of enabled) {
      const d = Math.abs(timeToMinutes(o.value) - target);
      if (d < dist) {
        best = o.value;
        dist = d;
      }
    }
    return best;
  };

  useIsomorphicLayoutEffect(() => {
    const el = floatingRef.current;
    if (!el) return;
    if (open) showInTopLayer(el);
    else hideFromTopLayer(el);
  }, [open, floatingRef]);

  // Keep the active option visible; on opening, center it in the list.
  useEffect(() => {
    if (!open || !active) return;
    const el = document.getElementById(optionId(active));
    el?.scrollIntoView?.({ block: centerOnOpen.current ? 'center' : 'nearest' });
    centerOnOpen.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from the stable auto id.
  }, [open, active]);

  // Mirror the parse error into native validation, so forms block submit and Field shows it.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.setCustomValidity(error ?? '');
    if (error) el.checkValidity();
    else if (hadError.current) el.dispatchEvent(new Event('input', { bubbles: true }));
    hadError.current = !!error;
  }, [error]);

  const setOpen = (next: boolean) => {
    if (next === open) return;
    setOpenRaw(next);
  };

  const openList = () => {
    if (disabled || readOnly) return;
    const typed = draft !== null ? parseTime(draft) : null;
    const anchor = typed ?? current;
    let target: number;
    if (anchor) target = timeToMinutes(anchor);
    else {
      const now = new Date();
      target = now.getHours() * 60 + now.getMinutes();
    }
    setActive(nearest(target));
    setNavigated(false);
    centerOnOpen.current = true;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setActive(null);
    setNavigated(false);
  };

  const choose = (v: string) => {
    if (options.find((o) => o.value === v)?.disabled) return;
    if (v !== current) setCurrent(v);
    setDraft(null);
    setError(null);
    close();
  };

  const fail = (message: string) => {
    setError(message);
    if (current !== null) setCurrent(null);
    announce(message);
  };

  /** Turns the typed text into a value. */
  const commit = () => {
    if (draft === null) return;
    const text = draft.trim();
    if (!text) {
      if (current !== null) setCurrent(null);
      setDraft(null);
      setError(null);
      return;
    }
    const parsed = parseTime(text) ?? parseByLabel(text, fmtOpts);
    if (!parsed) {
      fail(messages?.invalid ?? `Enter a time like ${fmt('09:30')}.`);
      return;
    }
    const n = timeToMinutes(parsed);
    if (n < minN || n > maxN) {
      fail(messages?.outOfRange ?? `Choose a time between ${fmt(minutesToTime(minN))} and ${fmt(minutesToTime(maxN))}.`);
      return;
    }
    if (isTimeDisabled?.(parsed)) {
      fail(messages?.unavailable ?? `${fmt(parsed)} is not available.`);
      return;
    }
    if (parsed !== current) setCurrent(parsed);
    setDraft(null);
    setError(null);
  };

  const move = (to: 'next' | 'prev' | 'first' | 'last' | 'pageDown' | 'pageUp') => {
    if (!enabled.length) return;
    const i = active ? enabled.findIndex((o) => o.value === active) : -1;
    const cur = active ? timeToMinutes(active) : -1;
    let next: string | undefined;
    if (to === 'first') next = enabled[0]?.value;
    else if (to === 'last') next = enabled[enabled.length - 1]?.value;
    else if (to === 'next') next = enabled[i < 0 ? 0 : Math.min(i + 1, enabled.length - 1)]?.value;
    else if (to === 'prev') next = enabled[i < 0 ? enabled.length - 1 : Math.max(i - 1, 0)]?.value;
    else if (to === 'pageDown')
      next = (enabled.find((o) => timeToMinutes(o.value) >= cur + 60) ?? enabled[enabled.length - 1])?.value;
    else next = ([...enabled].reverse().find((o) => timeToMinutes(o.value) <= cur - 60) ?? enabled[0])?.value;
    setActive(next ?? null);
    setNavigated(true);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        if (readOnly) return;
        e.preventDefault();
        if (!open) openList();
        else if (!e.altKey) move('next');
        break;
      case 'ArrowUp':
        if (readOnly) return;
        e.preventDefault();
        if (!open) openList();
        else if (e.altKey) close();
        else move('prev');
        break;
      case 'Home':
      case 'End':
        if (open) {
          e.preventDefault();
          move(e.key === 'Home' ? 'first' : 'last');
        }
        break;
      case 'PageDown':
      case 'PageUp':
        if (open) {
          e.preventDefault();
          move(e.key === 'PageDown' ? 'pageDown' : 'pageUp');
        }
        break;
      case 'Enter':
        if (open && active && (navigated || draft === null)) {
          e.preventDefault();
          choose(active);
        } else if (draft !== null) {
          e.preventDefault();
          commit();
          close();
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        } else if (draft !== null) {
          e.preventDefault();
          setDraft(null);
          setError(null);
        }
        break;
      case 'Tab':
        if (open) close();
        break;
    }
  };

  const isInvalid = invalid || !!error;
  const buttonLabel = toggleLabel ?? (display ? `Change time, ${display}` : 'Choose time');
  const activeOk = open && active && options.some((o) => o.value === active);

  return (
    <div
      className={cx(cls('timepicker'), className)}
      style={style}
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
    >
      <div ref={anchorRef} className={cls('timepicker__anchor')}>
        <Input
          {...rest}
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          type="text"
          role="combobox"
          size={size}
          invalid={isInvalid}
          disabled={disabled || undefined}
          readOnly={readOnly || undefined}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeOk ? optionId(active) : undefined}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            const text = e.target.value;
            setDraft(text);
            setNavigated(false);
            const parsed = parseTime(text);
            if (parsed) setActive(nearest(timeToMinutes(parsed)));
            if (!open && !readOnly) {
              if (!parsed) setActive(current ? nearest(timeToMinutes(current)) : null);
              setOpen(true);
            }
          }}
          onClick={(e) => {
            onClick?.(e);
            if (!open && !e.defaultPrevented) openList();
          }}
          onKeyDown={onKey}
          onBlur={(e) => {
            commit();
            close();
            onBlur?.(e);
          }}
          endAdornment={
            <button
              type="button"
              className={cls('timepicker__toggle')}
              aria-label={buttonLabel}
              aria-expanded={open}
              aria-controls={listId}
              // Out of the tab order, as in the APG combobox: Down / Alt+Down on the input open the list.
              tabIndex={-1}
              disabled={disabled || readOnly}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                inputRef.current?.focus();
                if (open) close();
                else openList();
              }}
            >
              <ClockIcon />
            </button>
          }
        />
      </div>
      <div
        ref={floatingRef}
        className={cx(cls('floating'), cls('timepicker__popup'))}
        data-os-theme={appearance === 'dark' ? 'dark' : undefined}
        data-appearance={appearance === 'translucent' ? 'translucent' : undefined}
        hidden={!open}
      >
        <div
          id={listId}
          role="listbox"
          aria-labelledby={field ? field.labelId : rest['aria-labelledby']}
          aria-label={field || rest['aria-labelledby'] ? undefined : (rest['aria-label'] ?? listLabel)}
          className={cls('timepicker__listbox')}
        >
          {options.map((o) => {
            const isSel = o.value === current;
            return (
              <div
                key={o.value}
                id={optionId(o.value)}
                role="option"
                aria-selected={isSel}
                aria-disabled={o.disabled || undefined}
                className={cls('timepicker__option')}
                data-active={(open && o.value === active) || undefined}
                // Focus stays on the input (aria-activedescendant); -1 only makes the option programmatically focusable.
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose(o.value);
                  }
                }}
                onMouseMove={() => {
                  if (o.disabled || o.value === active) return;
                  setActive(o.value);
                  setNavigated(true);
                }}
              >
                <span className={cls('timepicker__check')} aria-hidden="true">
                  {isSel && <CheckIcon strokeWidth={2.5} />}
                </span>
                <span className={cls('timepicker__label')}>{o.label}</span>
              </div>
            );
          })}
        </div>
        {options.length === 0 && <div className={cls('timepicker__empty')}>No times available</div>}
      </div>
      {name && <input type="hidden" name={name} value={current ?? ''} disabled={disabled || undefined} />}
    </div>
  );
});

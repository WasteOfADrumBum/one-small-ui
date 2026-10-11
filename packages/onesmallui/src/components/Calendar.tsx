import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

// ---------- date helpers (local time, no dependencies) ----------

export interface DateRange {
  start: Date | null;
  end: Date | null;
}
export type CalendarMode = 'single' | 'multiple' | 'range';
/** 0 = Sunday … 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}
export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();
/** `yyyy-mm-dd` in local time (the format of `<input type="date">`). */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Parses `yyyy-mm-dd` as a local date. */
export function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

/** First day of the week for a locale (Intl week info when the browser has it, else Sunday). */
export function weekStartFor(locale?: string): Weekday {
  try {
    const loc = new Intl.Locale(locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US')) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return (info.firstDay % 7) as Weekday;
  } catch {
    /* unsupported */
  }
  return 0;
}

type Norm = (Date | null)[];
export function toNorm(mode: CalendarMode, v: unknown): Norm | undefined {
  if (v === undefined) return undefined;
  if (mode === 'range') {
    const r = v as DateRange | null;
    return [r?.start ?? null, r?.end ?? null];
  }
  if (mode === 'multiple') return (v as Date[] | null) ?? [];
  return v ? [v as Date] : [];
}
export function fromNorm(mode: CalendarMode, n: Norm): unknown {
  if (mode === 'range') return { start: n[0] ?? null, end: n[1] ?? null } satisfies DateRange;
  if (mode === 'multiple') return n.filter(Boolean);
  return n[0] ?? null;
}

// ---------- Calendar ----------

interface CalendarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'color'> {
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Return true to disable a date (weekends, holidays, booked days). */
  isDateDisabled?: (date: Date) => boolean;
  /** Number of months shown side by side. */
  months?: number;
  /** 0 = Sunday … 6 = Saturday. Default: from `locale`. */
  firstDayOfWeek?: Weekday;
  /** BCP 47 locale for month and day names. Default: the browser's. */
  locale?: string;
  color?: ThemeColor;
  /** The (first) month shown. */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Move focus into the grid on mount (used by DatePicker). */
  autoFocus?: boolean;
  /** Labels for the month buttons. */
  labels?: { previous?: string; next?: string };
  /** Extra content under the grid (buttons, legends). */
  footer?: ReactNode;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single';
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}
export interface CalendarMultipleProps extends CalendarBaseProps {
  mode: 'multiple';
  value?: Date[];
  defaultValue?: Date[];
  onValueChange?: (value: Date[]) => void;
}
export interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
}
export type CalendarProps = CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps;

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" data-flip={flip || undefined}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

/**
 * A month grid following the WAI-ARIA date picker grid pattern: one tab stop, arrow
 * keys move by day and week, Home/End to the week's ends, Page Up/Down by month
 * (with Shift by year), Enter or Space selects. Month and day names come from `Intl`.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    isDateDisabled,
    months = 1,
    firstDayOfWeek,
    locale,
    color,
    month,
    defaultMonth,
    onMonthChange,
    autoFocus,
    labels,
    footer,
    className,
    ...rest
  } = props;
  const auto = `os-cal-${useId().replace(/:/g, '')}`;
  const [norm, setNormRaw] = useControllableState<Norm>(
    toNorm(mode, value),
    toNorm(mode, defaultValue) ?? (mode === 'range' ? [null, null] : []),
    (n) => (onValueChange as ((v: unknown) => void) | undefined)?.(fromNorm(mode, n)),
  );
  const today = startOfDay(new Date());
  const firstSelected = norm.find(Boolean) ?? null;
  const [view, setViewRaw] = useControllableState<Date>(
    month,
    (() => {
      const d = defaultMonth ?? firstSelected ?? today;
      return new Date(d.getFullYear(), d.getMonth(), 1);
    })(),
    onMonthChange,
  );
  const [focused, setFocused] = useState<Date>(() => {
    const f = firstSelected ?? today;
    return min && f < min ? startOfDay(min) : max && f > max ? startOfDay(max) : f;
  });
  const [hover, setHover] = useState<Date | null>(null);
  const shouldFocus = useRef(!!autoFocus);
  const root = useRef<HTMLDivElement | null>(null);
  const weekStart = firstDayOfWeek ?? weekStartFor(locale);

  const fmt = useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      full: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      dayNum: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      wdShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      wdLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
    }),
    [locale],
  );

  const isDisabled = (d: Date) =>
    (!!min && d < startOfDay(min)) || (!!max && d > startOfDay(max)) || !!isDateDisabled?.(d);

  const viewIdx = monthIndex(view);
  const ensureVisible = (d: Date) => {
    const idx = monthIndex(d);
    if (idx < viewIdx) setViewRaw(new Date(d.getFullYear(), d.getMonth(), 1));
    else if (idx > viewIdx + months - 1) setViewRaw(addMonths(new Date(d.getFullYear(), d.getMonth(), 1), -(months - 1)));
  };

  const moveFocus = (d: Date) => {
    let next = d;
    if (min && next < startOfDay(min)) next = startOfDay(min);
    if (max && next > startOfDay(max)) next = startOfDay(max);
    shouldFocus.current = true;
    setFocused(next);
    ensureVisible(next);
  };

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    root.current?.querySelector<HTMLElement>(`[data-date="${toISODate(focused)}"]`)?.focus();
  });

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    setFocused(d);
    if (mode === 'single') setNormRaw([d]);
    else if (mode === 'multiple') {
      setNormRaw(norm.some((x) => isSameDay(x, d)) ? norm.filter((x) => !isSameDay(x, d)) : [...norm, d]);
    } else {
      const [s, e] = norm;
      if (!s || e) setNormRaw([d, null]);
      else setNormRaw(d < s ? [d, s] : [s, d]);
    }
  };

  const onGridKey = (e: KeyboardEvent<HTMLTableElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const dir = rtl ? -1 : 1;
    const wd = (focused.getDay() - weekStart + 7) % 7;
    const map: Record<string, () => Date> = {
      ArrowRight: () => addDays(focused, dir),
      ArrowLeft: () => addDays(focused, -dir),
      ArrowDown: () => addDays(focused, 7),
      ArrowUp: () => addDays(focused, -7),
      Home: () => addDays(focused, -wd),
      End: () => addDays(focused, 6 - wd),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    moveFocus(fn());
  };

  const [rs, re] = mode === 'range' ? norm : [null, null];
  const previewEnd = mode === 'range' && rs && !re && hover ? hover : re;
  const [lo, hi] = rs && previewEnd ? (rs <= previewEnd ? [rs, previewEnd] : [previewEnd, rs]) : [rs, rs];
  const inRange = (d: Date) => mode === 'range' && !!lo && !!hi && d >= lo && d <= hi;
  const isSelected = (d: Date) => norm.some((x) => isSameDay(x, d));

  const weekdays = Array.from({ length: 7 }, (_, i) => {
    // 2023-01-01 was a Sunday.
    const d = new Date(2023, 0, 1 + ((weekStart + i) % 7));
    return { short: fmt.wdShort.format(d), long: fmt.wdLong.format(d) };
  });

  const canPrev = !min || monthIndex(addMonths(view, -1)) >= monthIndex(min);
  const canNext = !max || monthIndex(addMonths(view, months)) <= monthIndex(max);

  const grids = Array.from({ length: months }, (_, m) => {
    const first = new Date(view.getFullYear(), view.getMonth() + m, 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
    ];
    while (cells.length % 7) cells.push(null);
    const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
    return { first, weeks, headingId: `${auto}-m${m}` };
  });

  const focusInView = monthIndex(focused) >= viewIdx && monthIndex(focused) <= viewIdx + months - 1;
  const tabDate = focusInView ? focused : new Date(view.getFullYear(), view.getMonth(), 1);

  return (
    <div
      ref={(el) => {
        root.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={cx(cls('calendar'), className)}
      data-color={color}
      data-mode={mode}
      data-months={months}
      {...rest}
    >
      <div className={cls('calendar__nav')}>
        <button
          type="button"
          className={cls('calendar__nav-btn')}
          aria-label={labels?.previous ?? 'Previous month'}
          disabled={!canPrev}
          onClick={() => {
            setViewRaw(addMonths(view, -1));
            setFocused(addMonths(focused, -1));
          }}
        >
          <Chevron />
        </button>
        <button
          type="button"
          className={cls('calendar__nav-btn')}
          aria-label={labels?.next ?? 'Next month'}
          disabled={!canNext}
          onClick={() => {
            setViewRaw(addMonths(view, 1));
            setFocused(addMonths(focused, 1));
          }}
        >
          <Chevron flip />
        </button>
      </div>
      <div className={cls('calendar__months')}>
        {grids.map(({ first, weeks, headingId }, gi) => (
          <div key={headingId} className={cls('calendar__month')}>
            <div id={headingId} className={cls('calendar__heading')} aria-live={gi === 0 ? 'polite' : undefined}>
              {fmt.month.format(first)}
            </div>
            <table role="grid" className={cls('calendar__grid')} aria-labelledby={headingId} onKeyDown={onGridKey}>
              <thead>
                <tr>
                  {weekdays.map((w) => (
                    <th key={w.long} scope="col" abbr={w.long} className={cls('calendar__weekday')}>
                      {w.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((d, di) => {
                      if (!d) return <td key={`e${di}`} className={cls('calendar__cell')} />;
                      const sel = isSelected(d);
                      const disabled = isDisabled(d);
                      const range = inRange(d);
                      return (
                        <td
                          key={d.getDate()}
                          className={cls('calendar__cell')}
                          aria-selected={sel || (mode === 'range' && range && !!re) || undefined}
                          data-in-range={range || undefined}
                          data-range-start={(range && isSameDay(d, lo)) || undefined}
                          data-range-end={(range && isSameDay(d, hi)) || undefined}
                        >
                          <button
                            type="button"
                            className={cls('calendar__day')}
                            data-date={toISODate(d)}
                            data-selected={sel || undefined}
                            data-today={isSameDay(d, today) || undefined}
                            tabIndex={isSameDay(d, tabDate) ? 0 : -1}
                            aria-label={fmt.full.format(d)}
                            aria-current={isSameDay(d, today) ? 'date' : undefined}
                            aria-disabled={disabled || undefined}
                            onClick={() => select(d)}
                            onFocus={() => {
                              if (!isSameDay(d, focused)) setFocused(d);
                            }}
                            onMouseEnter={() => mode === 'range' && setHover(d)}
                            onMouseLeave={() => mode === 'range' && setHover(null)}
                          >
                            {fmt.dayNum.format(d)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {footer && <div className={cls('calendar__footer')}>{footer}</div>}
    </div>
  );
});

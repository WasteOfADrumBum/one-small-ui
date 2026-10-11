import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import {
  Calendar,
  fromNorm,
  parseISODate,
  toISODate,
  toNorm,
  type CalendarMode,
  type CalendarMultipleProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  type DateRange,
} from './Calendar';
import { useFieldContext, useFieldControl } from './Field';
import { Input } from './Input';
import { useInputGroupSize } from './InputGroup';
import type { ExtendedSize, Placement } from './types';

type CalendarPassThrough = 'min' | 'max' | 'isDateDisabled' | 'months' | 'firstDayOfWeek' | 'locale' | 'color' | 'labels';

interface DatePickerBaseProps {
  /** `input` (default): a text field you can type into, with a calendar button. `button`: a single button that opens the calendar. */
  trigger?: 'input' | 'button';
  /** How dates are displayed: `Intl.DateTimeFormat` options or your own function. Default `{ dateStyle: 'medium' }`. */
  format?: Intl.DateTimeFormatOptions | ((date: Date) => string);
  /** Turns typed text into a date (input trigger, single mode). Default accepts `yyyy-mm-dd` and anything `Date.parse` reads. */
  parse?: (text: string) => Date | null;
  placeholder?: string;
  /** Form field name. Dates are submitted as `yyyy-mm-dd` hidden inputs (range: start then end). */
  name?: string;
  placement?: ResponsiveValue<Placement>;
  /** `dark` forces the dark theme on the popup; `translucent` frosts it. */
  appearance?: 'default' | 'dark' | 'translucent';
  size?: ExtendedSize;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  /** Accessible name of the calendar dialog. */
  dialogLabel?: string;
  /** Close after picking a date (single) or completing a range. Default true. */
  closeOnSelect?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export type DatePickerProps =
  | (DatePickerBaseProps & Pick<CalendarSingleProps, CalendarPassThrough | 'mode' | 'value' | 'defaultValue' | 'onValueChange'>)
  | (DatePickerBaseProps & Pick<CalendarMultipleProps, CalendarPassThrough | 'mode' | 'value' | 'defaultValue' | 'onValueChange'>)
  | (DatePickerBaseProps & Pick<CalendarRangeProps, CalendarPassThrough | 'mode' | 'value' | 'defaultValue' | 'onValueChange'>);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const defaultParse = (text: string) => {
  const iso = parseISODate(text);
  if (iso) return iso;
  const t = Date.parse(text);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * A date field with a calendar popup, following the WAI-ARIA date picker dialog
 * pattern: the button opens a modal dialog, focus moves into the grid, Escape closes
 * it and returns focus. Single dates, several dates or a range.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(props, ref) {
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    trigger = 'input',
    format = { dateStyle: 'medium' },
    parse = defaultParse,
    placeholder,
    name,
    placement = 'bottom-start',
    appearance = 'default',
    size,
    disabled: disabledProp,
    required,
    invalid,
    id,
    className,
    'aria-label': ariaLabel,
    dialogLabel,
    closeOnSelect = true,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    min,
    max,
    isDateDisabled,
    months,
    firstDayOfWeek,
    locale,
    color,
    labels,
  } = props;
  const m = mode as CalendarMode;
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const auto = `os-dp-${useId().replace(/:/g, '')}`;
  const [current, setCurrent] = useControllableState<unknown>(
    value,
    defaultValue ?? (m === 'range' ? { start: null, end: null } : m === 'multiple' ? [] : null),
    onValueChange as ((v: unknown) => void) | undefined,
  );
  const [open, setOpenRaw] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [draft, setDraft] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { anchorRef, floatingRef } = useFloating<HTMLDivElement, HTMLDivElement>({ open, placement });
  const controlProps = useFieldControl<{ id?: string; disabled?: boolean; required?: boolean; 'aria-describedby'?: string }>({
    id,
    disabled: disabledProp,
    required,
  });
  const disabled = controlProps.disabled;
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];

  const fmt = (d: Date) =>
    typeof format === 'function' ? format(d) : new Intl.DateTimeFormat(locale, format).format(d);
  const norm = toNorm(m, current) ?? [];
  const dates = norm.filter(Boolean) as Date[];
  const display =
    m === 'range'
      ? norm[0]
        ? `${fmt(norm[0])} – ${norm[1] ? fmt(norm[1]) : '…'}`
        : ''
      : dates.map(fmt).join(', ');

  const setOpen = (next: boolean, returnFocus = true) => {
    setOpenRaw(next);
    if (!next && returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useLayoutEffect(() => {
    const el = floatingRef.current;
    if (!el) return;
    if (open) showInTopLayer(el);
    else hideFromTopLayer(el);
  }, [open, floatingRef]);

  // Close when pointing outside the trigger and the dialog.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (floatingRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      setOpen(false, false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onCalendarChange = (v: unknown) => {
    setCurrent(v);
    setDraft(null);
    if (!closeOnSelect) return;
    if (m === 'single' || (m === 'range' && (v as DateRange).end)) setOpen(false);
  };

  const onDialogKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'Tab') {
      // Keep focus inside the modal dialog.
      const items = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), [tabindex="0"]'),
      );
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const commitDraft = () => {
    if (draft === null) return;
    if (!draft.trim()) setCurrent(null);
    else {
      const d = parse(draft);
      if (d && !(min && d < min) && !(max && d > max) && !isDateDisabled?.(d)) setCurrent(d);
    }
    setDraft(null);
  };

  const toggleLabel = display ? `Change date, ${display}` : 'Choose date';
  const dialogName = dialogLabel ?? (m === 'range' ? 'Choose dates' : m === 'multiple' ? 'Choose dates' : 'Choose date');
  const valueId = `${auto}-value`;

  return (
    <div
      ref={ref}
      className={cx(cls('datepicker'), className)}
      data-trigger={trigger}
      data-state={open ? 'open' : 'closed'}
    >
      <div ref={anchorRef} className={cls('datepicker__anchor')}>
        {trigger === 'input' ? (
          <Input
            size={size ?? groupSize}
            id={id}
            disabled={disabledProp}
            required={required}
            aria-label={field ? undefined : ariaLabel}
            invalid={isInvalid}
            value={draft ?? display}
            placeholder={placeholder}
            readOnly={m !== 'single'}
            autoComplete="off"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onClick={() => m !== 'single' && !disabled && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitDraft();
              } else if (e.key === 'ArrowDown' && e.altKey) {
                e.preventDefault();
                setOpen(true);
              }
            }}
            endAdornment={
              <button
                ref={triggerRef}
                type="button"
                className={cls('datepicker__toggle')}
                aria-label={toggleLabel}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? `${auto}-dialog` : undefined}
                disabled={disabled}
                onClick={() => setOpen(!open)}
              >
                <CalendarIcon />
              </button>
            }
          />
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className={cls('datepicker__button')}
            data-size={size ?? groupSize ?? 'md'}
            data-invalid={isInvalid || undefined}
            id={controlProps.id}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? `${auto}-dialog` : undefined}
            aria-labelledby={field ? `${field.labelId} ${valueId}` : undefined}
            aria-label={field ? undefined : ariaLabel && `${ariaLabel}${display ? `, ${display}` : ''}`}
            aria-describedby={controlProps['aria-describedby']}
            aria-invalid={isInvalid || undefined}
            onClick={() => setOpen(!open)}
          >
            <CalendarIcon />
            <span id={valueId} className={cls('datepicker__value')} data-placeholder={!display || undefined}>
              {display || placeholder || 'Pick a date'}
            </span>
          </button>
        )}
      </div>
      <div
        ref={floatingRef}
        id={`${auto}-dialog`}
        role="dialog"
        aria-modal="true"
        aria-label={dialogName}
        className={cx(cls('floating'), cls('datepicker__popup'))}
        data-os-theme={appearance === 'dark' ? 'dark' : undefined}
        data-appearance={appearance === 'translucent' ? 'translucent' : undefined}
        hidden={!open}
        onKeyDown={onDialogKey}
      >
        {open && (
          <Calendar
            {...({ mode: m, value: current, onValueChange: onCalendarChange } as CalendarSingleProps)}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            months={months}
            firstDayOfWeek={firstDayOfWeek}
            locale={locale}
            color={color}
            labels={labels}
            autoFocus
            footer={
              m !== 'single' || !closeOnSelect ? (
                <>
                  <button type="button" className={cls('datepicker__action')} onClick={() => setCurrent(fromNorm(m, m === 'range' ? [null, null] : []))}>
                    Clear
                  </button>
                  <button type="button" className={cls('datepicker__action')} data-primary onClick={() => setOpen(false)}>
                    Done
                  </button>
                </>
              ) : undefined
            }
          />
        )}
      </div>
      {name &&
        (m === 'single' ? (
          <input type="hidden" name={name} value={dates[0] ? toISODate(dates[0]) : ''} />
        ) : m === 'range' ? (
          <>
            <input type="hidden" name={name} value={norm[0] ? toISODate(norm[0]) : ''} />
            <input type="hidden" name={name} value={norm[1] ? toISODate(norm[1]) : ''} />
          </>
        ) : (
          dates.map((d) => <input key={toISODate(d)} type="hidden" name={name} value={toISODate(d)} />)
        ))}
    </div>
  );
});

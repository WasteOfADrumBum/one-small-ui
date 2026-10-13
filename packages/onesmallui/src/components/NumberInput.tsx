import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { useLatestRef } from '../hooks/useLatestRef';
import { useMergedRefs } from '../hooks/useMergedRefs';
import { MinusIcon } from '../icons/MinusIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import { focusControlOnPress } from './Input';
import { useInputGroupSize } from './InputGroup';
import type { ExtendedSize } from './types';

/** Press-and-hold on a stepper button: wait this long, then repeat every `HOLD_INTERVAL` ms. Not animation. */
export const HOLD_DELAY = 400;
export const HOLD_INTERVAL = 60;

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'role' | 'prefix'
  > {
  /** The number, or `null` when empty. Percent values follow Intl: `0.25` shows as 25%. */
  value?: number | null;
  defaultValue?: number | null;
  /** Called while typing (unclamped), on every step and with the clamped value on blur. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Amount for Arrow Up/Down and the buttons. Defaults to 1, or 0.01 (1%) with `style: 'percent'`. */
  step?: number;
  /** Amount for Page Up/Down. Defaults to 10 × `step`. */
  largeStep?: number;
  /** Decimal places the value is rounded to on blur and when stepping. Defaults to the step's decimals. */
  precision?: number;
  /** `Intl.NumberFormat` options for the blurred display (currency, percent, unit, grouping). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Locale for formatting and for parsing group and decimal separators. Defaults to the runtime's. */
  locale?: string;
  /** Icon or text inside the start of the control. Text is linked with `aria-describedby`. */
  startAdornment?: ReactNode;
  /** Icon or text inside the end of the control, before the stepper buttons. */
  endAdornment?: ReactNode;
  /** Let the mouse wheel change the value, only while the input is focused. Off by default. */
  allowWheel?: boolean;
  /** Hide the increment and decrement buttons (keys still work). */
  hideStepper?: boolean;
  /** Accessible name of the increment button. */
  incrementLabel?: string;
  /** Accessible name of the decrement button. */
  decrementLabel?: string;
  /** Message announced when blur clamps a typed value to a bound. Receives the formatted value. */
  clampAnnouncement?: (formatted: string, bound: 'min' | 'max') => string;
  size?: ExtendedSize;
  invalid?: boolean;
  /** Class for the inner `<input>` (`className` goes on the wrapper). */
  controlClassName?: string;
}

const isText = (n: ReactNode) => typeof n === 'string' || typeof n === 'number';

/** Decimal places of a number, including exponent notation (`1e-7` → 7). */
export function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const [mantissa = '', exp] = String(n).split('e');
  const frac = mantissa.split('.')[1]?.length ?? 0;
  return Math.max(0, frac - (exp ? Number(exp) : 0));
}

/** Rounds half away from zero to `digits` places without binary drift (0.1 + 0.2 → 0.3). */
export function roundTo(n: number, digits: number): number {
  if (!Number.isFinite(n)) return n;
  const d = Math.max(0, Math.min(20, Math.round(digits)));
  const abs = Math.abs(n);
  const r = String(abs).includes('e')
    ? Number(abs.toFixed(d))
    : Number(`${Math.round(Number(`${abs}e${d}`))}e-${d}`);
  const out = Math.sign(n) * r;
  return Object.is(out, -0) ? 0 : out;
}

const MINUS = /[-−‒–﹣－]/;

/**
 * Parses text typed in `locale`: strips group separators, currency, percent and
 * unit text, reads the locale's decimal separator (and `.`, when it isn't the
 * group separator) and native digits. Returns `null` for empty text and `NaN`
 * for text that holds no number.
 */
export function parseNumber(text: string, locale?: string): number {
  return makeParser(locale)(text) as number;
}

function makeParser(locale?: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((p) => p.type === 'group')?.value ?? ',';
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  const nativeDigits = new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210);
  const digitMap = new Map<string, string>();
  Array.from(nativeDigits).forEach((c, i) => digitMap.set(c, String(9 - i)));
  const groupIsSpace = /^\s$/.test(group);
  return (text: string): number | null => {
    let s = Array.from(text.trim(), (c) => digitMap.get(c) ?? c).join('');
    if (!s) return null;
    const negative = MINUS.test(s) || /^\(.*\)$/.test(s);
    s = s.replace(/\s/g, '');
    if (!groupIsSpace) s = s.split(group).join('');
    if (decimal !== '.') s = s.split(decimal).join('.');
    s = s.replace(/[^0-9.]/g, '');
    if (!/\d/.test(s) || s.indexOf('.') !== s.lastIndexOf('.')) return NaN;
    const n = Number(s);
    return negative ? -n : n;
  };
}

function makeFormatter(locale: string | undefined, options: Intl.NumberFormatOptions | undefined, precision?: number) {
  const percent = options?.style === 'percent';
  const extra: Intl.NumberFormatOptions = {};
  if (precision != null && options?.maximumFractionDigits == null && options?.maximumSignificantDigits == null) {
    extra.maximumFractionDigits = Math.max(options?.minimumFractionDigits ?? 0, percent ? precision - 2 : precision, 0);
  }
  try {
    return new Intl.NumberFormat(locale, { ...extra, ...options });
  } catch {
    return new Intl.NumberFormat(locale, options);
  }
}

const clampTo = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

/**
 * A text input for numbers with `role="spinbutton"`: Arrow keys step, Page Up/Down
 * take large steps and Home/End jump to the bounds. It shows the locale-formatted
 * value (currency, percent, units) when blurred and the plain number while editing,
 * clamps on blur, and submits the raw number (`1234.5`) under `name`.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step: stepProp,
    largeStep: largeStepProp,
    precision,
    formatOptions,
    locale,
    startAdornment,
    endAdornment,
    allowWheel,
    hideStepper,
    incrementLabel = 'Increase',
    decrementLabel = 'Decrease',
    clampAnnouncement = (v, bound) => `Adjusted to the ${bound === 'min' ? 'minimum' : 'maximum'}, ${v}`,
    size,
    invalid,
    controlClassName,
    className,
    style,
    name,
    form,
    onFocus,
    onBlur,
    onKeyDown,
    onChange,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const { announce } = useAnnouncer();
  const auto = `os-number-${useId().replace(/:/g, '')}`;
  const startId = isText(startAdornment) ? `${auto}-start` : undefined;
  const endId = isText(endAdornment) ? `${auto}-end` : undefined;
  const controlProps = useFieldControl({
    ...props,
    'aria-describedby': [props['aria-describedby'], startId, endId].filter(Boolean).join(' ') || undefined,
  });
  const inputId = controlProps.id ?? auto;
  const disabled = !!controlProps.disabled;
  const readOnly = !!(controlProps as { readOnly?: boolean }).readOnly;
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const canEdit = !disabled && !readOnly;

  const [value, setValue] = useControllableState<number | null>(valueProp, defaultValue, onValueChange);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const percent = formatOptions?.style === 'percent';
  const scale = percent ? 100 : 1;
  const step = stepProp && stepProp > 0 ? stepProp : percent ? 0.01 : 1;
  const largeStep = largeStepProp && largeStepProp > 0 ? largeStepProp : step * 10;
  const stepDigits = precision ?? Math.max(decimalsOf(step), decimalsOf(min ?? 0));

  const formatter = useMemo(() => makeFormatter(locale, formatOptions, precision), [locale, formatOptions, precision]);
  const parser = useMemo(() => makeParser(locale), [locale]);
  const editFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 }),
    [locale],
  );

  const format = useCallback((n: number | null) => (n == null ? '' : formatter.format(n)), [formatter]);
  const toEdit = useCallback(
    (n: number | null) => (n == null ? '' : editFormatter.format(roundTo(n * scale, 10))),
    [editFormatter, scale],
  );
  /** Typed text → value units (percent text is divided by 100). `null` empty, `NaN` invalid. */
  const parse = useCallback(
    (text: string): number | null => {
      const n = parser(text);
      if (n == null || Number.isNaN(n) || scale === 1) return n;
      return roundTo(n / scale, decimalsOf(n) + 2);
    },
    [parser, scale],
  );

  // The latest value, so press-and-hold ticks build on each other before React re-renders.
  const valueRef = useLatestRef(value);
  const focusedRef = useLatestRef(focused);
  const draftRef = useLatestRef(draft);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(inputRef, ref);

  const commitValue = (next: number | null) => {
    valueRef.current = next;
    setValue(next);
    if (focusedRef.current) setDraft(toEdit(next));
  };

  /** Steps by `amount` × `dir`, snapped to the step grid. Returns whether the value changed. */
  const stepBy = (dir: 1 | -1, amount = step): boolean => {
    if (!canEdit) return false;
    const typed = focusedRef.current ? parse(draftRef.current) : valueRef.current;
    const base = typed == null || Number.isNaN(typed) ? valueRef.current : typed;
    let next: number;
    if (base == null) {
      next = clampTo(0, min, max);
    } else {
      const origin = min ?? 0;
      const k = (base - origin) / step;
      const eps = 1e-9;
      const m = amount / step;
      next = dir > 0 ? origin + (Math.floor(k + eps) + m) * step : origin + (Math.ceil(k - eps) - m) * step;
      next = clampTo(roundTo(next, stepDigits), min, max);
    }
    if (next === base && next === valueRef.current) return false;
    commitValue(next);
    return true;
  };
  const stepRef = useLatestRef(stepBy);

  // Keep the edit text in sync when the value changes from outside while focused.
  useEffect(() => {
    if (!focusedRef.current) return;
    const typed = parse(draftRef.current);
    if (typed !== value && !(Number.isNaN(typed) && value === null)) setDraft(toEdit(value));
  }, [value, parse, toEdit, focusedRef, draftRef]);

  // Press-and-hold repeat.
  const hold = useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});
  const stopHold = useCallback(() => {
    clearTimeout(hold.current.timeout);
    clearInterval(hold.current.interval);
    hold.current = {};
  }, []);
  useEffect(() => stopHold, [stopHold]);
  useEffect(() => {
    if (!canEdit) stopHold();
  }, [canEdit, stopHold]);

  const startHold = (dir: 1 | -1) => {
    stopHold();
    if (!stepRef.current(dir)) return;
    hold.current.timeout = setTimeout(() => {
      hold.current.interval = setInterval(() => {
        if (!stepRef.current(dir)) stopHold();
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  };

  // Wheel: opt-in, only while focused. React's onWheel is passive, so preventDefault needs a native listener.
  useEffect(() => {
    const el = inputRef.current;
    if (!el || !allowWheel || !canEdit) return;
    const onWheel = (e: WheelEvent) => {
      if (el.ownerDocument.activeElement !== el || e.deltaY === 0) return;
      e.preventDefault();
      stepRef.current(e.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [allowWheel, canEdit, stepRef]);

  // Native form reset: restore the default (uncontrolled) value.
  const defaultRef = useLatestRef(defaultValue);
  const setValueRef = useLatestRef(setValue);
  useEffect(() => {
    const owner = inputRef.current?.form;
    if (!owner) return;
    const onReset = () => {
      valueRef.current = defaultRef.current;
      setValueRef.current(defaultRef.current);
    };
    owner.addEventListener('reset', onReset);
    return () => owner.removeEventListener('reset', onReset);
  }, [defaultRef, setValueRef, valueRef]);

  /** Blur and Enter: parse, clamp, round. Invalid text restores the last value. */
  const commitDraft = () => {
    const typed = parse(draftRef.current);
    if (typed == null || Number.isNaN(typed)) {
      if (typed == null && valueRef.current !== null) commitValue(null);
      else if (focusedRef.current) setDraft(toEdit(valueRef.current));
      return;
    }
    const rounded = precision != null ? roundTo(typed, precision) : typed;
    const clamped = clampTo(rounded, min, max);
    if (clamped !== rounded) announce(clampAnnouncement(format(clamped), clamped === min ? 'min' : 'max'));
    if (clamped !== valueRef.current) commitValue(clamped);
    else if (focusedRef.current) setDraft(toEdit(clamped));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const actions: Record<string, (() => void) | undefined> = {
      ArrowUp: () => stepBy(1),
      ArrowDown: () => stepBy(-1),
      PageUp: () => stepBy(1, largeStep),
      PageDown: () => stepBy(-1, largeStep),
      Home: min != null ? () => canEdit && commitValue(min) : undefined,
      End: max != null ? () => canEdit && commitValue(max) : undefined,
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    } else if (e.key === 'Enter') {
      commitDraft();
    }
  };

  const atMin = value != null && min != null && value <= min;
  const atMax = value != null && max != null && value >= max;
  const formatted = format(value);
  const valueText = value != null && formatted !== String(value) ? formatted : undefined;

  const stepper = (dir: 1 | -1) => {
    const label = dir > 0 ? incrementLabel : decrementLabel;
    const off = !canEdit || (dir > 0 ? atMax : atMin);
    return (
      <button
        type="button"
        tabIndex={-1}
        className={cls('number-input__button')}
        aria-label={label}
        aria-controls={inputId}
        disabled={off}
        data-direction={dir > 0 ? 'increment' : 'decrement'}
        // Keep focus (and the caret) where it is: these buttons are outside the tab order.
        onMouseDown={(e: MouseEvent<HTMLButtonElement>) => e.preventDefault()}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          if (e.button > 0) return;
          e.preventDefault();
          startHold(dir);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={(e) => {
          // Keyboard or assistive-technology activation has no pointer press (detail 0).
          if (e.detail === 0) stepBy(dir);
        }}
      >
        {dir > 0 ? <PlusIcon /> : <MinusIcon />}
      </button>
    );
  };

  return (
    // Presentation: a styling wrapper; its mousedown only forwards focus to the input inside.
    <div
      role="presentation"
      className={cx(cls('input'), cls('number-input'), className)}
      style={style}
      data-size={size ?? groupSize ?? 'md'}
      data-invalid={isInvalid ? true : undefined}
      data-valid={(!isInvalid && field?.valid) || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-hide-stepper={hideStepper || undefined}
      onMouseDown={(e) => focusControlOnPress(e, `.${cls('number-input__control')}`)}
    >
      {startAdornment != null && startAdornment !== false && (
        <span id={startId} className={cls('input__adornment')} data-position="start">
          {startAdornment}
        </span>
      )}
      <input
        ref={mergedRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        {...controlProps}
        id={inputId}
        role="spinbutton"
        className={cx(cls('input__control'), cls('number-input__control'), controlClassName)}
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        aria-invalid={isInvalid ? true : undefined}
        value={focused ? draft : formatted}
        onFocus={(e) => {
          setFocused(true);
          setDraft(toEdit(valueRef.current));
          onFocus?.(e);
        }}
        onBlur={(e) => {
          stopHold();
          commitDraft();
          setFocused(false);
          onBlur?.(e);
        }}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          const typed = parse(text);
          if (!Number.isNaN(typed) && typed !== valueRef.current) {
            valueRef.current = typed;
            setValue(typed);
          }
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
      />
      {endAdornment != null && endAdornment !== false && (
        <span id={endId} className={cls('input__adornment')} data-position="end">
          {endAdornment}
        </span>
      )}
      {!hideStepper && (
        <span className={cls('number-input__stepper')}>
          {stepper(-1)}
          {stepper(1)}
        </span>
      )}
      {name && <input type="hidden" name={name} form={form} disabled={disabled} value={value == null ? '' : String(value)} />}
    </div>
  );
});

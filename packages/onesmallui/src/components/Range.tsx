import { forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldControl } from './Field';
import type { Size, ThemeColor } from './types';

export interface RangeTick {
  value: number;
  /** Visible text under the tick. Also used as the datalist option label. */
  label?: ReactNode;
}

export interface RangeProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Show the current value in a bubble above the thumb (an `<output>`). */
  showValue?: boolean;
  /** Show the min and max under the track. */
  showMinMax?: boolean;
  /**
   * Tick marks. `true` puts one on every step; an array of numbers or `{ value, label }`
   * places them explicitly. Ticks also render a `<datalist>`, so browsers can snap to them.
   */
  ticks?: boolean | number[] | RangeTick[];
  /** Formats the bubble, the min/max labels and `aria-valuetext`. */
  formatValue?: (value: number) => string;
  color?: ThemeColor;
  size?: Size;
  invalid?: boolean;
}

/**
 * A slider built on native `<input type="range">`, so arrow keys, Page Up/Down,
 * Home/End and screen reader support all come from the browser. Adds a filled
 * track, a value bubble, min/max labels and tick marks.
 */
export const Range = forwardRef<HTMLInputElement, RangeProps>(function Range(
  {
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    showValue,
    showMinMax,
    ticks,
    formatValue = String,
    color,
    size,
    invalid,
    className,
    style,
    onChange,
    ...props
  },
  ref,
) {
  const auto = `os-range-${useId().replace(/:/g, '')}`;
  const [current, setCurrent] = useControllableState<number>(value, defaultValue ?? (min + max) / 2, onValueChange);
  const controlProps = useFieldControl(props);
  const inputId = controlProps.id ?? auto;
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;

  let tickList: RangeTick[] = [];
  if (ticks === true) {
    const count = Math.floor((max - min) / step);
    if (count <= 100) tickList = Array.from({ length: count + 1 }, (_, i) => ({ value: min + i * step }));
  } else if (Array.isArray(ticks)) {
    tickList = (ticks as (number | RangeTick)[]).map((t) => (typeof t === 'number' ? { value: t } : t));
  }
  const listId = tickList.length ? `${auto}-ticks` : undefined;
  const hasLabels = tickList.some((t) => t.label != null);

  return (
    <div
      className={cx(cls('range'), className)}
      style={{ ...style, '--_pct': `${pct}%`, '--_ratio': pct / 100 } as CSSProperties}
      data-color={color}
      data-size={size}
      data-disabled={controlProps.disabled || undefined}
      data-invalid={isInvalid || undefined}
      data-show-value={showValue || undefined}
    >
      <div className={cls('range__track-wrap')}>
        <input
          ref={ref}
          type="range"
          className={cls('range__input')}
          min={min}
          max={max}
          step={step}
          list={listId}
          aria-valuetext={formatValue === String ? undefined : formatValue(current)}
          {...controlProps}
          id={inputId}
          value={current}
          aria-invalid={isInvalid || undefined}
          onChange={(e) => {
            setCurrent(Number(e.target.value));
            onChange?.(e);
          }}
        />
        {showValue && (
          <output htmlFor={inputId} className={cls('range__bubble')} aria-hidden="true">
            {formatValue(current)}
          </output>
        )}
      </div>
      {tickList.length > 0 && (
        <>
          <datalist id={listId}>
            {tickList.map((t) => (
              <option key={t.value} value={t.value} label={typeof t.label === 'string' ? t.label : undefined} />
            ))}
          </datalist>
          <div className={cls('range__ticks')} aria-hidden="true" data-labelled={hasLabels || undefined}>
            {tickList.map((t) => (
              <span
                key={t.value}
                className={cls('range__tick')}
                style={{ '--_at': `${((t.value - min) / (max - min)) * 100}%` } as CSSProperties}
                data-active={t.value <= current || undefined}
              >
                {t.label != null && <span className={cls('range__tick-label')}>{t.label}</span>}
              </span>
            ))}
          </div>
        </>
      )}
      {showMinMax && (
        <div className={cls('range__minmax')} aria-hidden="true">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
});

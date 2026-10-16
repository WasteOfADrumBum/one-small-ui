import {
  forwardRef,
  useId,
  useState,
  type ComponentType,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useControllableState } from '../hooks/useControllableState';
import { StarIcon } from '../icons/StarIcon';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import type { ExtendedSize, ThemeColor } from './types';

export interface RatingProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange' | 'color'> {
  /** Group label, rendered as the `<legend>`. Inside a `Field`, the Field label names it instead. */
  label?: ReactNode;
  /** The rating, or `null` for none. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** Number of icons. */
  max?: number;
  /** `1` for whole steps, `0.5` for half steps. */
  precision?: 1 | 0.5;
  /** Choosing the current value again (click, or Space on the checked option) clears the rating. */
  allowClear?: boolean;
  /** A display, not an input: one `role="img"` named "4.5 out of 5 stars". */
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Form field name. Interactive ratings submit the checked radio; read-only ones a hidden input. */
  name?: string;
  /** The shape drawn for each step. Filled when selected, outlined when not. */
  icon?: ComponentType<{ className?: string }>;
  size?: ExtendedSize;
  color?: ThemeColor;
  /** Name of each option. Default "3 stars", "3.5 stars". */
  getLabel?: (value: number, max: number) => string;
  /** Accessible name of a read-only rating. Default "4.5 out of 5 stars", or "No rating". */
  getValueText?: (value: number | null, max: number) => string;
  /** Announced when `allowClear` clears the rating. */
  clearedMessage?: string;
}

const defaultLabel = (v: number) => `${v} ${v === 1 ? 'star' : 'stars'}`;
const defaultValueText = (v: number | null, max: number) => (v == null ? 'No rating' : `${v} out of ${max} stars`);

type Fill = 'full' | 'half' | 'empty';
const fillAt = (value: number | null, i: number): Fill =>
  value == null || value <= i - 1 ? 'empty' : value >= i ? 'full' : 'half';

function Glyph({ Icon, fill }: { Icon: ComponentType<{ className?: string }>; fill: Fill }) {
  // The same icon twice: an outline, and a filled copy clipped to the inline-start half
  // or the whole glyph. The clip is a logical box, so half stars mirror in RTL.
  return (
    <span className={cls('rating__glyph')} data-fill={fill} aria-hidden="true">
      <Icon className={cls('rating__icon')} />
      <span className={cls('rating__fill')}>
        <Icon className={cls('rating__icon')} />
      </span>
    </span>
  );
}

/**
 * A star rating. Interactive ratings are a `<fieldset>` of visually hidden native radios,
 * one per step, so arrow keys, `Field`, `Form`, validation and native submission all work.
 * Read-only ratings render one `role="img"` with the value in its name.
 */
export const Rating = forwardRef<HTMLElement, RatingProps>(function Rating(
  {
    label,
    value,
    defaultValue = null,
    onValueChange,
    max = 5,
    precision = 1,
    allowClear,
    readOnly: readOnlyProp,
    disabled: disabledProp,
    required: requiredProp,
    invalid,
    name,
    icon: Icon = StarIcon,
    size = 'md',
    color = 'warning',
    getLabel = defaultLabel,
    getValueText = defaultValueText,
    clearedMessage = 'Rating cleared',
    className,
    id: idProp,
    'aria-describedby': describedByProp,
    'aria-labelledby': labelledByProp,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const auto = `os-rating-${useId().replace(/:/g, '')}`;
  const control = useFieldControl({
    id: idProp,
    'aria-describedby': describedByProp,
    required: requiredProp,
    disabled: disabledProp,
    readOnly: readOnlyProp,
  }) as {
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
  };
  const id = control.id ?? auto;
  const legendId = `${id}-label`;
  const isInvalid = !!(invalid || control['aria-invalid']);
  const { announce } = useAnnouncer();
  const [current, setCurrent] = useControllableState<number | null>(value, defaultValue, onValueChange);
  const [hover, setHover] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const items = Array.from({ length: max }, (_, i) => i + 1);

  if (control.readOnly) {
    // Round the drawing to the precision; the name keeps the exact value.
    const shown = current == null ? null : Math.min(max, Math.round(current / precision) * precision);
    return (
      <span
        ref={ref as ForwardedRef<HTMLSpanElement>}
        id={id}
        role="img"
        aria-label={getValueText(current, max)}
        // Inside a Field the label comes first: "Quality, 4.5 out of 5 stars".
        aria-labelledby={field ? `${field.labelId} ${id}` : labelledByProp}
        aria-describedby={control['aria-describedby']}
        className={cx(cls('rating'), className)}
        data-readonly=""
        data-size={size}
        data-color={color}
        {...rest}
      >
        {items.map((i) => (
          <span key={i} className={cls('rating__item')}>
            <Glyph Icon={Icon} fill={fillAt(shown, i)} />
          </span>
        ))}
        {name && current != null && <input type="hidden" name={name} value={current} />}
      </span>
    );
  }

  const groupName = name ?? auto;
  const disabled = !!control.disabled;
  const shown = hover ?? focused ?? current;
  const steps = (i: number) => (precision === 0.5 ? [i - 0.5, i] : [i]);

  const clear = () => {
    setHover(null);
    setFocused(null);
    setCurrent(null);
    announce(clearedMessage);
  };

  return (
    // radiogroup (not the fieldset's implicit group) so the invalid and required states are valid ARIA.
    <fieldset
      ref={ref as ForwardedRef<HTMLFieldSetElement>}
      id={id}
      role="radiogroup"
      aria-labelledby={label != null ? legendId : (field?.labelId ?? labelledByProp)}
      aria-describedby={control['aria-describedby']}
      aria-invalid={isInvalid || undefined}
      aria-required={control.required || undefined}
      disabled={disabled}
      className={cx(cls('rating'), className)}
      data-size={size}
      data-color={color}
      data-precision={precision === 0.5 ? 'half' : 'whole'}
      data-preview={shown !== current || undefined}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {label != null && (
        <legend id={legendId} className={cls('field__label')}>
          {label}
          {control.required && (
            <span className={cls('field__required')} aria-hidden="true">
              {' '}*
            </span>
          )}
          {control.required && <span className={cls('sr-only')}> (required)</span>}
        </legend>
      )}
      <span className={cls('rating__items')} onPointerLeave={() => setHover(null)}>
        {items.map((i) => (
          <span key={i} className={cls('rating__item')} data-hovered={hover != null && Math.ceil(hover) === i ? '' : undefined}>
            <Glyph Icon={Icon} fill={fillAt(shown, i)} />
            {steps(i).map((v) => (
              <input
                key={v}
                type="radio"
                name={groupName}
                value={v}
                aria-label={getLabel(v, max)}
                className={cls('rating__input')}
                data-half={v % 1 ? '' : undefined}
                checked={current === v}
                required={control.required || undefined}
                onChange={() => setCurrent(v)}
                // A click on the checked radio fires no change event; that is the "choose again" gesture.
                onClick={() => {
                  if (allowClear && current === v) clear();
                }}
                onPointerEnter={() => {
                  if (!disabled) setHover(v);
                }}
                onFocus={() => setFocused(v)}
                onBlur={() => setFocused(null)}
              />
            ))}
          </span>
        ))}
      </span>
    </fieldset>
  );
});

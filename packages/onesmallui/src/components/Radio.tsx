import { createContext, forwardRef, useContext, useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { CheckLookProps } from './Checkbox';
import type { Size, ThemeColor } from './types';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (v: string) => void;
  disabled?: boolean;
  color?: ThemeColor;
  size?: Size;
  variant?: 'default' | 'card';
  invalid?: boolean;
  required?: boolean;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Group label, rendered as the fieldset legend. */
  label: ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Lay options out in a row on wider screens. */
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  required?: boolean;
  hint?: ReactNode;
  /** Error for the whole group, announced politely; marks every radio invalid. */
  error?: ReactNode;
  /** Color, size and variant for every radio inside. */
  color?: ThemeColor;
  size?: Size;
  /** `card` renders each option as a selectable card (laid out in a responsive grid). */
  variant?: 'default' | 'card';
  className?: string;
  children: ReactNode;
}

/** A labelled set of radio buttons. Arrow keys move between options (native behavior). */
export function RadioGroup({
  label,
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled,
  required,
  hint,
  error,
  color,
  size,
  variant,
  className,
  children,
}: RadioGroupProps) {
  const auto = useId().replace(/:/g, '');
  const groupName = name ?? `os-radio-${auto}`;
  const hintId = hint ? `os-rg-${auto}-hint` : undefined;
  const errorId = error ? `os-rg-${auto}-error` : undefined;
  const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, (v) =>
    onValueChange?.(v as string),
  );
  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value: current, setValue: setCurrent, disabled, color, size, variant, invalid: !!error, required }}
    >
      <fieldset
        className={cx(cls('radio-group'), className)}
        data-orientation={orientation}
        data-variant={variant === 'card' ? 'card' : undefined}
        data-invalid={error ? true : undefined}
        disabled={disabled}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      >
        <legend className={cls('field__label')}>
          {label}
          {required && (
            <span className={cls('field__required')} aria-hidden="true">
              {' '}*
            </span>
          )}
          {required && <span className={cls('sr-only')}> (required)</span>}
        </legend>
        {hint && (
          <p id={hintId} className={cls('field__hint')}>
            {hint}
          </p>
        )}
        <div className={cls('radio-group__options')}>{children}</div>
        <div aria-live="polite">
          {error && (
            <p id={errorId} className={cls('field__error')}>
              {error}
            </p>
          )}
        </div>
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color'>, CheckLookProps {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, color, size, variant, invalid, className, id, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const auto = useId();
  const inputId = id ?? `os-r-${auto.replace(/:/g, '')}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const isInvalid = invalid ?? group?.invalid;
  const groupProps = group
    ? {
        name: group.name,
        checked: group.value === value,
        required: rest.required ?? group.required,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          group.setValue(value);
          onChange?.(e);
        },
      }
    : { onChange };
  const v = variant ?? group?.variant;
  return (
    <div
      className={cx(cls('check'), cls('radio'), className)}
      data-color={color ?? group?.color}
      data-size={size ?? group?.size}
      data-variant={v === 'card' ? 'card' : undefined}
      data-disabled={rest.disabled || group?.disabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        value={value}
        className={cls('check__input')}
        aria-describedby={descId}
        aria-invalid={isInvalid || undefined}
        {...rest}
        {...groupProps}
      />
      <span className={cx(cls('check__box'), cls('radio__dot'))} aria-hidden="true" />
      <span className={cls('check__text')}>
        <label htmlFor={inputId} className={cls('check__label')}>
          {label}
        </label>
        {description && (
          <span id={descId} className={cls('check__description')}>
            {description}
          </span>
        )}
      </span>
    </div>
  );
});

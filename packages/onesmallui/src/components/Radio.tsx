import { createContext, forwardRef, useContext, useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (v: string) => void;
  disabled?: boolean;
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
  hint?: ReactNode;
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
  hint,
  className,
  children,
}: RadioGroupProps) {
  const auto = useId();
  const groupName = name ?? `os-radio-${auto.replace(/:/g, '')}`;
  const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, (v) =>
    onValueChange?.(v as string),
  );
  return (
    <RadioGroupContext.Provider value={{ name: groupName, value: current, setValue: setCurrent, disabled }}>
      <fieldset className={cx(cls('radio-group'), className)} data-orientation={orientation} disabled={disabled}>
        <legend className={cls('field__label')}>{label}</legend>
        {hint && <p className={cls('field__hint')}>{hint}</p>}
        <div className={cls('radio-group__options')}>{children}</div>
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, className, id, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const auto = useId();
  const inputId = id ?? `os-r-${auto.replace(/:/g, '')}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const groupProps = group
    ? {
        name: group.name,
        checked: group.value === value,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
          group.setValue(value);
          onChange?.(e);
        },
      }
    : { onChange };
  return (
    <div className={cx(cls('check'), cls('radio'), className)} data-disabled={rest.disabled || group?.disabled || undefined}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        value={value}
        className={cls('check__input')}
        aria-describedby={descId}
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

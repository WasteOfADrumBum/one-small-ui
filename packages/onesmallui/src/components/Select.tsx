import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldControl } from './Field';
import type { Size } from './types';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: Size;
  /** Options as data. You can also pass `<option>` children instead. */
  options?: SelectOption[];
  /** Placeholder shown as a disabled first option. */
  placeholder?: string;
  invalid?: boolean;
}

/** A styled native `<select>`, so it keeps full keyboard, mobile and screen reader support. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', options, placeholder, invalid, className, children, ...props },
  ref,
) {
  const controlProps = useFieldControl(props);
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  return (
    <div className={cx(cls('select'), className)} data-size={size} data-invalid={isInvalid || undefined}>
      <select
        ref={ref}
        className={cls('select__control')}
        defaultValue={placeholder && props.value === undefined && props.defaultValue === undefined ? '' : undefined}
        {...controlProps}
        aria-invalid={isInvalid || undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label as string}
          </option>
        ))}
        {children}
      </select>
      <svg className={cls('select__chevron')} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});

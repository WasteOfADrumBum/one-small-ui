import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import { focusControlOnPress, type InputVariant } from './Input';
import { useInputGroupSize } from './InputGroup';
import type { ExtendedSize } from './types';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Options with the same group are rendered inside one `<optgroup>`. */
  group?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: ExtendedSize;
  /** Number of visible rows (the native `size` attribute). Shows a list box instead of a drop-down. */
  htmlSize?: number;
  variant?: Exclude<InputVariant, 'plaintext'>;
  /** Options as data. You can also pass `<option>` children instead. */
  options?: SelectOption[];
  /** Placeholder shown as a disabled first option (single selects only). */
  placeholder?: string;
  /** Decorative icon or short text inside the start of the control. */
  startAdornment?: ReactNode;
  invalid?: boolean;
  /** Show the success style. */
  valid?: boolean;
}

function renderOptions(options: SelectOption[]) {
  const out: ReactNode[] = [];
  const groups = new Map<string, SelectOption[]>();
  for (const o of options) {
    if (!o.group) {
      out.push(
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label as string}
        </option>,
      );
      continue;
    }
    if (!groups.has(o.group)) {
      groups.set(o.group, []);
      out.push(o.group);
    }
    groups.get(o.group)!.push(o);
  }
  return out.map((item) =>
    typeof item === 'string' ? (
      <optgroup key={`g-${item}`} label={item}>
        {groups.get(item)!.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label as string}
          </option>
        ))}
      </optgroup>
    ) : (
      item
    ),
  );
}

/** A styled native `<select>`, so it keeps full keyboard, mobile and screen reader support. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size, htmlSize, variant = 'default', options, placeholder, startAdornment, invalid, valid, className, children, ...props },
  ref,
) {
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const controlProps = useFieldControl(props);
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const isValid = !isInvalid && (valid || field?.valid);
  const listBox = !!props.multiple || (htmlSize ?? 0) > 1;
  const usePlaceholder = placeholder && !listBox;
  // Floating labels key off :placeholder-shown, which selects don't have; they always float.
  const { placeholder: _ignored, ...selectProps } = controlProps as typeof controlProps & { placeholder?: string };
  void _ignored;
  return (
    <div
      className={cx(cls('select'), className)}
      data-size={size ?? groupSize ?? 'md'}
      data-variant={variant === 'default' ? undefined : variant}
      data-multiple={listBox || undefined}
      data-invalid={isInvalid || undefined}
      data-valid={isValid || undefined}
      data-disabled={controlProps.disabled || undefined}
      data-adorned={startAdornment ? true : undefined}
      onMouseDown={(e) => focusControlOnPress(e, 'select')}
    >
      {startAdornment && (
        <span className={cx(cls('input__adornment'), cls('select__adornment'))} aria-hidden="true">
          {startAdornment}
        </span>
      )}
      <select
        ref={ref}
        className={cls('select__control')}
        size={htmlSize}
        defaultValue={usePlaceholder && props.value === undefined && props.defaultValue === undefined ? '' : undefined}
        {...selectProps}
        aria-invalid={isInvalid || undefined}
      >
        {usePlaceholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options && renderOptions(options)}
        {children}
      </select>
      {!listBox && (
        <svg className={cls('select__chevron')} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
});

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldControl } from './Field';
import type { Size } from './types';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
  /** Decorative icon or text shown inside the start of the input. */
  startAdornment?: ReactNode;
  /** Decorative icon, text or a small button shown inside the end of the input. */
  endAdornment?: ReactNode;
  invalid?: boolean;
}

/** Single-line text input. Put it inside a `Field` for a label, hint and error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', startAdornment, endAdornment, invalid, className, ...props },
  ref,
) {
  const controlProps = useFieldControl(props);
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  return (
    <div
      className={cx(cls('input'), className)}
      data-size={size}
      data-invalid={isInvalid ? true : undefined}
      data-disabled={controlProps.disabled || undefined}
    >
      {startAdornment && <span className={cls('input__adornment')}>{startAdornment}</span>}
      <input
        ref={ref}
        className={cls('input__control')}
        {...controlProps}
        aria-invalid={isInvalid ? true : undefined}
      />
      {endAdornment && <span className={cls('input__adornment')}>{endAdornment}</span>}
    </div>
  );
});

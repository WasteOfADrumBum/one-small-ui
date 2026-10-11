import { forwardRef, useId, type InputHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import { useInputGroupSize } from './InputGroup';
import type { ExtendedSize } from './types';

/** `default` bordered control, `ghost` (borderless until hover or focus) or `plaintext` (read-only value as text). */
export type InputVariant = 'default' | 'ghost' | 'plaintext';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: ExtendedSize;
  variant?: InputVariant;
  /**
   * Icon or text shown inside the start of the input. Text (a string or number) is
   * linked to the input with `aria-describedby`; icons should be decorative.
   */
  startAdornment?: ReactNode;
  /** Icon, text or a small button shown inside the end of the input. */
  endAdornment?: ReactNode;
  invalid?: boolean;
  /** Show the success style. */
  valid?: boolean;
  /** Browser suggestions: renders a `<datalist>` and links it with `list`. */
  suggestions?: string[];
  /** Class for the inner `<input>` (`className` goes on the wrapper). */
  controlClassName?: string;
}

const isText = (n: ReactNode) => typeof n === 'string' || typeof n === 'number';

/** Focus the control when the wrapper (padding, adornments, enlarged hit area) is pressed. */
export function focusControlOnPress(e: MouseEvent<HTMLElement>, selector: string) {
  const t = e.target as HTMLElement;
  if (t.closest('button, a, input, select, textarea, [tabindex]')) return;
  const control = e.currentTarget.querySelector<HTMLElement>(selector);
  if (!control || (control as HTMLInputElement).disabled) return;
  e.preventDefault();
  control.focus();
}

/** Single-line input for text, numbers, dates and times, colors and files. Put it inside a `Field` for a label, hint and error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    variant = 'default',
    startAdornment,
    endAdornment,
    invalid,
    valid,
    suggestions,
    controlClassName,
    className,
    style,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const auto = `os-in-${useId().replace(/:/g, '')}`;
  const startId = isText(startAdornment) ? `${auto}-start` : undefined;
  const endId = isText(endAdornment) ? `${auto}-end` : undefined;
  const listId = suggestions?.length ? `${auto}-list` : undefined;
  const readOnlyDefault = variant === 'plaintext' && props.readOnly === undefined ? { readOnly: true } : null;
  const controlProps = useFieldControl({
    ...props,
    ...readOnlyDefault,
    'aria-describedby': [props['aria-describedby'], startId, endId].filter(Boolean).join(' ') || undefined,
  });
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const isValid = !isInvalid && (valid || field?.valid);
  return (
    <div
      className={cx(cls('input'), className)}
      style={style}
      data-size={size ?? groupSize ?? 'md'}
      data-variant={variant === 'default' ? undefined : variant}
      data-type={props.type}
      data-invalid={isInvalid ? true : undefined}
      data-valid={isValid || undefined}
      data-disabled={controlProps.disabled || undefined}
      data-readonly={(controlProps as { readOnly?: boolean }).readOnly || undefined}
      onMouseDown={(e) => focusControlOnPress(e, `.${cls('input__control')}`)}
    >
      {startAdornment != null && startAdornment !== false && (
        <span id={startId} className={cls('input__adornment')} data-position="start">
          {startAdornment}
        </span>
      )}
      <input
        ref={ref}
        className={cx(cls('input__control'), controlClassName)}
        list={listId}
        {...controlProps}
        aria-invalid={isInvalid ? true : undefined}
      />
      {endAdornment != null && endAdornment !== false && (
        <span id={endId} className={cls('input__adornment')} data-position="end">
          {endAdornment}
        </span>
      )}
      {listId && (
        <datalist id={listId}>
          {suggestions!.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
});

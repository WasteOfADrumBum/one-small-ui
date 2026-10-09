import { forwardRef, useState, type CSSProperties, type FormEvent, type FormHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * `vertical` (default) stacks fields; `horizontal` puts every Field's label in a
   * column beside its control (from `sm` up); `inline` lines fields up in a wrapping row;
   * `grid` places fields in responsive columns.
   */
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  /** Column count for `layout="grid"` from `md` up. Sets `--os-form-cols`. */
  columns?: number;
  /** Label column width for `layout="horizontal"`. Sets `--os-field-label-width`. */
  labelWidth?: string;
  /**
   * `custom` (default): the browser's bubbles are off, invalid fields are styled and
   * their messages shown in each Field, and focus moves to the first invalid control.
   * `native`: the browser's own validation bubbles. `none`: no validation on submit.
   */
  validation?: 'custom' | 'native' | 'none';
  /** Force the "was validated" state (show every invalid control), e.g. after a server round trip. */
  validated?: boolean;
  /** Called instead of `onSubmit` when submission is blocked by invalid controls. */
  onInvalidSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * A `<form>` with layouts and validation styling. Controls show their invalid state
 * only once touched (`:user-invalid` / `data-touched`) or after a submit attempt
 * (`data-validated`), so users aren't scolded before they start typing.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    layout = 'vertical',
    columns,
    labelWidth,
    validation = 'custom',
    validated,
    onInvalidSubmit,
    onSubmit,
    onReset,
    noValidate,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [attempted, setAttempted] = useState(false);
  const vars: Record<string, string> = {};
  if (columns) vars['--os-form-cols'] = String(columns);
  if (labelWidth) vars['--os-field-label-width'] = labelWidth;
  return (
    <form
      ref={ref}
      className={cx(cls('form'), className)}
      data-layout={layout}
      data-validated={validated || attempted || undefined}
      noValidate={noValidate ?? validation !== 'native'}
      style={{ ...style, ...vars } as CSSProperties}
      onSubmit={(e) => {
        if (validation === 'custom') {
          const form = e.currentTarget;
          setAttempted(true);
          if (!form.checkValidity()) {
            e.preventDefault();
            form.querySelector<HTMLElement>(':invalid:not(fieldset):not(form)')?.focus();
            onInvalidSubmit?.(e);
            return;
          }
        }
        onSubmit?.(e);
      }}
      onReset={(e) => {
        setAttempted(false);
        onReset?.(e);
      }}
      {...rest}
    />
  );
});

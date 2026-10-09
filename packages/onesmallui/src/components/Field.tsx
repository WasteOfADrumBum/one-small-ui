import { createContext, forwardRef, useContext, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

interface FieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** Helper text under the control, linked with `aria-describedby`. */
  hint?: ReactNode;
  /** Error message. Marks the control `aria-invalid` and is announced politely. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean;
  /** Override the generated control id. */
  id?: string;
  children: ReactNode;
}

/**
 * Wraps a form control with a label, hint and error, wiring up ids and ARIA
 * automatically for `Input`, `Textarea` and `Select`.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, required = false, disabled = false, hideLabel, id, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const controlId = id ?? `os-field-${auto.replace(/:/g, '')}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  return (
    <FieldContext.Provider value={{ id: controlId, hintId, errorId, invalid: !!error, required, disabled }}>
      <div
        ref={ref}
        className={cx(cls('field'), className)}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <label htmlFor={controlId} className={cx(cls('field__label'), hideLabel && cls('sr-only'))}>
          {label}
          {required && (
            <span className={cls('field__required')} aria-hidden="true">
              {' '}*
            </span>
          )}
          {required && <span className={cls('sr-only')}> (required)</span>}
        </label>
        {children}
        {hint && (
          <p id={hintId} className={cls('field__hint')}>
            {hint}
          </p>
        )}
        <div aria-live="polite">
          {error && (
            <p id={errorId} className={cls('field__error')}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 8v5m0 3h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    </FieldContext.Provider>
  );
});

/** Merges Field context into a control's props. Used by the built-in controls and available for your own. */
export function useFieldControl<P extends { id?: string; 'aria-describedby'?: string; required?: boolean; disabled?: boolean }>(
  props: P,
) {
  const field = useContext(FieldContext);
  if (!field) return props;
  const describedBy = [props['aria-describedby'], field.hintId, field.errorId].filter(Boolean).join(' ') || undefined;
  return {
    ...props,
    id: props.id ?? field.id,
    'aria-describedby': describedBy,
    'aria-invalid': field.invalid || undefined,
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
  };
}

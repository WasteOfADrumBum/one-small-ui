import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

/** Where the label sits relative to its control. */
export type FieldLayout = 'vertical' | 'horizontal' | 'inline' | 'floating';

export interface FieldContextValue {
  /** Id of the control. */
  id: string;
  /** Id of the visible label element. */
  labelId: string;
  hintId?: string;
  errorId?: string;
  successId?: string;
  invalid: boolean;
  valid: boolean;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  layout: FieldLayout;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** The surrounding `Field`, if any. Use it to wire custom controls. */
export const useFieldContext = () => useContext(FieldContext);

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** Helper text under the control, linked with `aria-describedby`. */
  hint?: ReactNode;
  /** Same as `hint`. */
  description?: ReactNode;
  /** Error message. Marks the control `aria-invalid` and is announced politely. */
  error?: ReactNode;
  /** Success message. Marks the field valid and is announced politely. */
  success?: ReactNode;
  /** Show the valid style without a message. */
  valid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean;
  /**
   * `vertical` (label above, default), `horizontal` (label in a column beside the control
   * from `sm` up), `inline` (label and control on one line) or `floating` (label inside the
   * control that floats up when it has a value).
   */
  layout?: FieldLayout;
  /** With `layout="floating"`: keep the label floated even when the control is empty. */
  alwaysFloat?: boolean;
  /** Width of the label column in the horizontal layout. Sets `--os-field-label-width`. */
  labelWidth?: string;
  /** Show feedback as text below the control (default) or as a bubble anchored under it. */
  feedback?: 'below' | 'tooltip';
  /** Override the generated control id. */
  id?: string;
  children: ReactNode;
}

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 8v5m0 3h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
    <path d="m8 12.5 2.8 2.8L16.5 9" />
  </svg>
);

type ValidatableTarget = EventTarget & { validity?: ValidityState; validationMessage?: string };

/**
 * Wraps a form control with a label, hint and feedback, wiring up ids and ARIA
 * automatically for `Input`, `Textarea`, `Select`, `Range`, `Combobox`, `DatePicker`,
 * `ChipInput` and `OtpInput`.
 *
 * Without an `error` prop it shows the browser's own validation message once the
 * control fires `invalid` (on submit or `checkValidity()`), and clears it when fixed.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    hint,
    description,
    error,
    success,
    valid,
    required = false,
    disabled = false,
    readOnly = false,
    hideLabel,
    layout = 'vertical',
    alwaysFloat,
    labelWidth,
    feedback = 'below',
    id,
    className,
    style,
    children,
    onInvalidCapture,
    onInputCapture,
    onChangeCapture,
    onBlurCapture,
    ...rest
  },
  ref,
) {
  const auto = useId();
  const controlId = id ?? `os-field-${auto.replace(/:/g, '')}`;
  const [nativeError, setNativeError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const shownError = error ?? (nativeError || undefined);
  const helper = hint ?? description;
  const hintId = helper ? `${controlId}-hint` : undefined;
  const errorId = shownError ? `${controlId}-error` : undefined;
  const successId = success && !shownError ? `${controlId}-success` : undefined;
  const isValid = !shownError && (!!success || !!valid);
  const labelId = `${controlId}-label`;

  const recheck = (e: FormEvent<HTMLDivElement>) => {
    if (!nativeError) return;
    const t = e.target as ValidatableTarget;
    if (!t.validity) return;
    setNativeError(t.validity.valid ? '' : (t.validationMessage ?? ''));
  };

  const ctx: FieldContextValue = {
    id: controlId,
    labelId,
    hintId,
    errorId,
    successId,
    invalid: !!shownError,
    valid: isValid,
    required,
    disabled,
    readOnly,
    layout,
  };

  const labelEl = (
    <label
      id={labelId}
      htmlFor={controlId}
      className={cx(cls('field__label'), hideLabel && layout !== 'floating' && cls('sr-only'))}
    >
      {label}
      {required && (
        <span className={cls('field__required')} aria-hidden="true">
          {' '}*
        </span>
      )}
      {required && <span className={cls('sr-only')}> (required)</span>}
    </label>
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx(cls('field'), className)}
        data-layout={layout}
        data-float={layout === 'floating' && alwaysFloat ? 'always' : undefined}
        data-feedback={feedback}
        data-invalid={shownError ? true : undefined}
        data-valid={isValid || undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-touched={touched || undefined}
        style={labelWidth ? ({ ...style, '--os-field-label-width': labelWidth } as CSSProperties) : style}
        onInvalidCapture={(e) => {
          const t = e.target as ValidatableTarget;
          if (error === undefined && t.validationMessage) setNativeError(t.validationMessage);
          setTouched(true);
          onInvalidCapture?.(e);
        }}
        onInputCapture={(e) => {
          recheck(e);
          onInputCapture?.(e);
        }}
        onChangeCapture={(e) => {
          recheck(e);
          onChangeCapture?.(e);
        }}
        onBlurCapture={(e) => {
          if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) setTouched(true);
          onBlurCapture?.(e);
        }}
        {...rest}
      >
        {layout !== 'floating' && labelEl}
        <div className={cls('field__body')}>
          {layout === 'floating' ? (
            <div className={cls('field__float')}>
              {children}
              {labelEl}
            </div>
          ) : (
            children
          )}
          {helper && (
            <p id={hintId} className={cls('field__hint')}>
              {helper}
            </p>
          )}
          <div aria-live="polite" className={cls('field__live')}>
            {shownError && (
              <p id={errorId} className={cls('field__error')}>
                <ErrorIcon />
                {shownError}
              </p>
            )}
            {successId && (
              <p id={successId} className={cls('field__success')}>
                <SuccessIcon />
                {success}
              </p>
            )}
          </div>
        </div>
      </div>
    </FieldContext.Provider>
  );
});

/** A `Field` with `layout="floating"`: the label sits inside the control and floats up. */
export const FloatingLabel = forwardRef<HTMLDivElement, Omit<FieldProps, 'layout'>>(function FloatingLabel(props, ref) {
  return <Field ref={ref} layout="floating" {...props} />;
});

/** Merges Field context into a control's props. Used by the built-in controls and available for your own. */
export function useFieldControl<P extends { id?: string; 'aria-describedby'?: string; required?: boolean; disabled?: boolean }>(
  props: P,
) {
  const field = useContext(FieldContext);
  if (!field) return props;
  const describedBy =
    [props['aria-describedby'], field.hintId, field.errorId, field.successId].filter(Boolean).join(' ') || undefined;
  const p = props as P & { placeholder?: string; readOnly?: boolean };
  return {
    ...props,
    id: props.id ?? field.id,
    'aria-describedby': describedBy,
    'aria-invalid': field.invalid || undefined,
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
    ...(field.readOnly && p.readOnly === undefined ? { readOnly: true } : null),
    // Floating labels rely on :placeholder-shown, so every control needs a placeholder.
    ...(field.layout === 'floating' && !p.placeholder ? { placeholder: ' ' } : null),
  };
}

// ---------- FieldGroup ----------

export interface FieldGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** Group label, rendered as the `<legend>`. */
  legend: ReactNode;
  /** Helper text under the legend, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Group-level error, announced politely. */
  error?: ReactNode;
  /** `plain` (default) or `card`: the fieldset rendered as a bordered card with a header. */
  variant?: 'plain' | 'card';
  /** How children are laid out: stacked (default), in a wrapping row, or a responsive grid. */
  layout?: 'stack' | 'inline' | 'grid';
  /** Minimum column width for `layout="grid"`. Sets `--os-field-group-min`. */
  minItemWidth?: string;
  disabled?: boolean;
  /** Visually hide the legend (still announced). */
  hideLegend?: boolean;
}

/**
 * Groups related controls in a native `<fieldset>` with a `<legend>`, so screen
 * readers announce the group name when focus enters it. Disabling the group
 * disables every control inside.
 */
export const FieldGroup = forwardRef<HTMLFieldSetElement, FieldGroupProps>(function FieldGroup(
  {
    legend,
    description,
    error,
    variant = 'plain',
    layout = 'stack',
    minItemWidth,
    disabled,
    hideLegend,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const auto = `os-fg-${useId().replace(/:/g, '')}`;
  const descId = description ? `${auto}-desc` : undefined;
  const errId = error ? `${auto}-error` : undefined;
  return (
    <fieldset
      ref={ref}
      className={cx(cls('field-group'), className)}
      data-variant={variant}
      data-layout={layout}
      data-invalid={error ? true : undefined}
      disabled={disabled}
      aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
      style={minItemWidth ? ({ ...style, '--os-field-group-min': minItemWidth } as CSSProperties) : style}
      {...rest}
    >
      <legend className={cx(cls('field-group__legend'), hideLegend && cls('sr-only'))}>{legend}</legend>
      {description && (
        <p id={descId} className={cls('field-group__description')}>
          {description}
        </p>
      )}
      <div className={cls('field-group__body')}>{children}</div>
      <div aria-live="polite">
        {error && (
          <p id={errId} className={cls('field__error')}>
            <ErrorIcon />
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
});

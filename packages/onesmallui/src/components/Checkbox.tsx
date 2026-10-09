import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** Extra text under the label, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Shows a dash for "some selected". */
  indeterminate?: boolean;
}

/** A native checkbox with a custom, animated look. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `os-cb-${auto.replace(/:/g, '')}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const inner = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx(cls('check'), className)} data-disabled={rest.disabled || undefined}>
      <input
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        id={inputId}
        type="checkbox"
        className={cls('check__input')}
        aria-describedby={descId}
        data-indeterminate={indeterminate || undefined}
        {...rest}
      />
      <span className={cls('check__box')} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path className={cls('check__tick')} d="m5 12.5 4.5 4.5L19 7.5" />
          <path className={cls('check__dash')} d="M6 12h12" />
        </svg>
      </span>
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

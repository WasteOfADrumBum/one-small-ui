import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { Size, ThemeColor } from './types';

/** Shared look props for Checkbox, Radio and Switch. */
export interface CheckLookProps {
  /** Fill color when checked. Default `primary`. */
  color?: ThemeColor;
  size?: Size;
  /** `card`: a bordered, full-width choice card that highlights when checked. */
  variant?: 'default' | 'card';
  /** Marks the control `aria-invalid` and shows the error style. */
  invalid?: boolean;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color'>, CheckLookProps {
  label: ReactNode;
  /** Extra text under the label, linked with `aria-describedby`. */
  description?: ReactNode;
  /** Shows a dash for "some selected". */
  indeterminate?: boolean;
}

/** A native checkbox with a custom, animated look. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, color, size, variant, invalid, className, id, ...rest },
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
    <div
      className={cx(cls('check'), className)}
      data-color={color}
      data-size={size}
      data-variant={variant === 'card' ? 'card' : undefined}
      data-disabled={rest.disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <input
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        {...rest}
        id={inputId}
        type="checkbox"
        className={cls('check__input')}
        aria-describedby={[rest['aria-describedby'], descId].filter(Boolean).join(' ') || undefined}
        aria-invalid={invalid || rest['aria-invalid'] || undefined}
        data-indeterminate={indeterminate || undefined}
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

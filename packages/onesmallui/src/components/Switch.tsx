import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  description?: ReactNode;
  /** Put the label before the track. */
  labelPosition?: 'start' | 'end';
}

/** An on/off toggle. Uses a native checkbox with `role="switch"`. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, labelPosition = 'end', className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `os-sw-${auto.replace(/:/g, '')}`;
  const descId = description ? `${inputId}-desc` : undefined;
  return (
    <div
      className={cx(cls('switch'), className)}
      data-label-position={labelPosition}
      data-disabled={rest.disabled || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className={cls('switch__input')}
        aria-describedby={descId}
        {...rest}
      />
      <span className={cls('switch__track')} aria-hidden="true">
        <span className={cls('switch__thumb')} />
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

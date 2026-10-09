import { forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { CheckLookProps } from './Checkbox';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color'>, CheckLookProps {
  label: ReactNode;
  description?: ReactNode;
  /** Put the label before the track. */
  labelPosition?: 'start' | 'end';
  /** Custom track width (any CSS length). Sets `--os-switch-width`. */
  width?: string;
}

/** An on/off toggle. Uses a native checkbox with `role="switch"`. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, labelPosition = 'end', color, size, variant, invalid, width, className, style, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `os-sw-${auto.replace(/:/g, '')}`;
  const descId = description ? `${inputId}-desc` : undefined;
  return (
    <div
      className={cx(cls('switch'), className)}
      style={width ? ({ ...style, '--os-switch-width': width } as CSSProperties) : style}
      data-label-position={labelPosition}
      data-color={color}
      data-size={size}
      data-variant={variant === 'card' ? 'card' : undefined}
      data-disabled={rest.disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className={cls('switch__input')}
        aria-describedby={descId}
        aria-invalid={invalid || undefined}
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

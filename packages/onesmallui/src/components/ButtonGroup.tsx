import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { ButtonDefaultsContext, type ButtonDefaults, type ButtonShape, type ButtonVariant } from './Button';
import type { Color, ExtendedSize } from './types';

export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, ButtonDefaults {
  orientation?: 'horizontal' | 'vertical';
  /** Join the buttons into one control with shared borders. Default true. */
  attached?: boolean;
  /** Draw a divider line between attached buttons. */
  dividers?: boolean;
  /** Names the group for screen readers. */
  'aria-label'?: string;
}

/**
 * Groups related buttons. `size`, `variant`, `color` and `shape` set here become
 * the defaults for every Button and ToggleButton inside. Groups can be nested.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', attached = true, dividers, variant, color, size, shape, className, children, ...rest },
  ref,
) {
  const parent = useContext(ButtonDefaultsContext);
  const defaults = {
    variant: variant ?? parent.variant,
    color: color ?? parent.color,
    size: size ?? parent.size,
    shape: shape ?? parent.shape,
  };
  return (
    <ButtonDefaultsContext.Provider value={defaults}>
      <div
        ref={ref}
        role="group"
        className={cx(cls('btn-group'), className)}
        data-orientation={orientation}
        data-attached={attached || undefined}
        data-dividers={dividers || undefined}
        {...rest}
      >
        {children}
      </div>
    </ButtonDefaultsContext.Provider>
  );
});

export interface ButtonToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Required: describes the toolbar. */
  'aria-label': string;
  orientation?: 'horizontal' | 'vertical';
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled])';

/**
 * A row of button groups and controls following the WAI-ARIA toolbar pattern:
 * one Tab stop, arrow keys move between controls, Home and End jump to the ends.
 */
export const ButtonToolbar = forwardRef<HTMLDivElement, ButtonToolbarProps>(function ButtonToolbar(
  { orientation = 'horizontal', className, children, onKeyDown, ...rest },
  ref,
) {
  const inner = useRef<HTMLDivElement | null>(null);

  const items = () => Array.from(inner.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
  // Radios share one stop per group natively; only the checked (or first) one counts.
  const stops = () =>
    items().filter((el) => {
      if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) return true;
      const group = items().filter((o) => o instanceof HTMLInputElement && o.name === el.name) as HTMLInputElement[];
      const current = group.find((r) => r.checked) ?? group[0];
      return el === current;
    });

  const setRoving = (active?: HTMLElement) => {
    const list = stops();
    const keep = active && list.includes(active) ? active : list[0];
    for (const el of items()) el.tabIndex = el === keep ? 0 : -1;
  };

  useEffect(() => setRoving());

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    // Inside a radio group, arrows change the selection natively; Home/End still jump.
    if (target instanceof HTMLInputElement && target.type === 'radio' && e.key.startsWith('Arrow')) {
      if (items().filter((o) => o instanceof HTMLInputElement && o.name === target.name).length > 1) return;
    }
    const list = stops();
    const i = list.findIndex(
      (el) => el === target || (el instanceof HTMLInputElement && target instanceof HTMLInputElement && !!el.name && el.name === target.name),
    );
    if (i < 0) return;
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const rtl = orientation === 'horizontal' && getComputedStyle(e.currentTarget).direction === 'rtl';
    let to: HTMLElement | undefined;
    if (e.key === (rtl ? prev : next)) to = list[(i + 1) % list.length];
    else if (e.key === (rtl ? next : prev)) to = list[(i - 1 + list.length) % list.length];
    else if (e.key === 'Home') to = list[0];
    else if (e.key === 'End') to = list[list.length - 1];
    if (to) {
      e.preventDefault();
      setRoving(to);
      to.focus();
    }
  };

  return (
    <div
      ref={(el) => {
        inner.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      role="toolbar"
      aria-orientation={orientation}
      className={cx(cls('btn-toolbar'), className)}
      data-orientation={orientation}
      onKeyDown={handleKey}
      onFocus={(e) => setRoving(e.target as HTMLElement)}
      {...rest}
    >
      {children}
    </div>
  );
});

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  name: string;
  value: string[];
  toggle: (v: string, on: boolean) => void;
  disabled?: boolean;
}
const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export interface ToggleButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color'> {
  /** `checkbox` toggles on its own; `radio` is one choice of many. Inside a ToggleButtonGroup this comes from the group. */
  type?: 'checkbox' | 'radio';
  variant?: ButtonVariant;
  color?: Color;
  size?: ExtendedSize;
  shape?: ButtonShape;
  /** Visual style when checked. Default `solid`. */
  checkedVariant?: ButtonVariant;
  iconOnly?: boolean;
  children: ReactNode;
}

/**
 * A checkbox or radio that looks like a button. The real input stays in the page,
 * so forms submit it, Space toggles it and screen readers announce its state.
 */
export const ToggleButton = forwardRef<HTMLInputElement, ToggleButtonProps>(function ToggleButton(
  { type, variant, color, size, shape, checkedVariant = 'solid', iconOnly, id, className, children, value, onChange, disabled, ...rest },
  ref,
) {
  const defaults = useContext(ButtonDefaultsContext);
  const group = useContext(ToggleGroupContext);
  const auto = useId();
  const inputId = id ?? `os-tb-${auto.replace(/:/g, '')}`;
  const v = value === undefined ? undefined : String(value);
  const groupProps =
    group && v !== undefined
      ? {
          type: group.type === 'single' ? 'radio' : 'checkbox',
          name: group.name,
          checked: group.value.includes(v),
          disabled: disabled ?? group.disabled,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            group.toggle(v, e.target.checked);
            onChange?.(e);
          },
        }
      : { type: type ?? 'checkbox', disabled, onChange };
  const resolvedShape = shape ?? defaults.shape ?? 'default';
  return (
    <span className={cx(cls('toggle-btn'), className)} data-checked-variant={checkedVariant}>
      <input ref={ref} id={inputId} className={cls('toggle-btn__input')} value={value} {...rest} {...groupProps} />
      <label
        htmlFor={inputId}
        className={cls('btn')}
        data-variant={variant ?? defaults.variant ?? 'outline'}
        data-color={color ?? defaults.color ?? 'primary'}
        data-size={size ?? defaults.size ?? 'md'}
        data-shape={resolvedShape === 'default' ? undefined : resolvedShape}
        data-icon-only={iconOnly || undefined}
      >
        {children}
      </label>
    </span>
  );
});

export interface ToggleButtonGroupProps extends Omit<ButtonGroupProps, 'defaultValue' | 'onChange'> {
  /** `single` behaves like radios, `multiple` like checkboxes. */
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Form field name. Generated when omitted. */
  name?: string;
  disabled?: boolean;
}

/** A ButtonGroup of ToggleButtons sharing one value. */
export const ToggleButtonGroup = forwardRef<HTMLDivElement, ToggleButtonGroupProps>(function ToggleButtonGroup(
  { type = 'single', value, defaultValue = [], onValueChange, name, disabled, children, ...rest },
  ref,
) {
  const auto = useId();
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const toggle = (v: string, on: boolean) => {
    if (type === 'single') setCurrent(on ? [v] : []);
    else setCurrent(on ? [...current.filter((x) => x !== v), v] : current.filter((x) => x !== v));
  };
  return (
    <ToggleGroupContext.Provider
      value={{ type, name: name ?? `os-tbg-${auto.replace(/:/g, '')}`, value: current, toggle, disabled }}
    >
      <ButtonGroup ref={ref} {...rest}>
        {children}
      </ButtonGroup>
    </ToggleGroupContext.Provider>
  );
});

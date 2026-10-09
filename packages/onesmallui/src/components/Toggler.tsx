import { forwardRef, useEffect, useState, type MouseEvent, type RefObject } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { Button, type ButtonProps } from './Button';

/** A CSS selector (all matches), an element, a ref, or a list of them. */
export type TogglerTarget = string | Element | RefObject<Element | null> | (string | Element | RefObject<Element | null>)[];

export interface UseTogglerOptions {
  /** What to change. Omit to just track the pressed state. */
  target?: TogglerTarget;
  /** Space-separated classes added while pressed and removed otherwise. */
  toggleClass?: string;
  /** Attribute to set while pressed. */
  toggleAttribute?: string;
  /** Attribute value while pressed. Default `''` (a boolean attribute). */
  onValue?: string | null;
  /** Attribute value while not pressed. Omit to remove the attribute instead. */
  offValue?: string | null;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/** Resolves a `TogglerTarget` to elements. */
export function resolveTargets(target: TogglerTarget | undefined): Element[] {
  if (!target || typeof document === 'undefined') return [];
  const list = Array.isArray(target) ? target : [target];
  return list.flatMap((t) => {
    if (typeof t === 'string') return Array.from(document.querySelectorAll(t));
    if (t instanceof Element) return [t];
    return t.current ? [t.current] : [];
  });
}

/**
 * Toggles classes and/or an attribute on one or many target elements, in sync
 * with a pressed state. Returns the state, a `toggle()` and the targets' ids.
 */
export function useToggler({
  target,
  toggleClass,
  toggleAttribute,
  onValue = '',
  offValue,
  pressed,
  defaultPressed = false,
  onPressedChange,
}: UseTogglerOptions = {}) {
  const [on, setOn] = useControllableState(pressed, defaultPressed, onPressedChange);
  const [ids, setIds] = useState<string>('');

  useEffect(() => {
    const els = resolveTargets(target);
    const classes = toggleClass?.split(/\s+/).filter(Boolean) ?? [];
    for (const el of els) {
      for (const c of classes) el.classList.toggle(c, on);
      if (toggleAttribute) {
        const v = on ? onValue : offValue;
        if (v === null || v === undefined) el.removeAttribute(toggleAttribute);
        else el.setAttribute(toggleAttribute, v);
      }
    }
    setIds(
      els
        .map((el) => el.id)
        .filter(Boolean)
        .join(' '),
    );
    // Targets given as a fresh array each render are compared by content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, toggleClass, toggleAttribute, onValue, offValue, JSON.stringify(Array.isArray(target) ? target.map(String) : String(target))]);

  return { pressed: on, setPressed: setOn, toggle: () => setOn(!on), controls: ids || undefined };
}

export type TogglerProps = Omit<ButtonProps, 'href'> &
  UseTogglerOptions & {
    /**
     * `'pressed'` (default) for on/off switches: sets `aria-pressed`.
     * `'expanded'` for show/hide disclosures: sets `aria-expanded` and `aria-controls`.
     */
    mode?: 'pressed' | 'expanded';
  };

/**
 * A button that toggles classes or attribute values on other elements
 * (one, several via a selector, or itself via `target` refs).
 */
export const Toggler = forwardRef<HTMLButtonElement, TogglerProps>(function Toggler(
  {
    target,
    toggleClass,
    toggleAttribute,
    onValue,
    offValue,
    pressed,
    defaultPressed,
    onPressedChange,
    mode = 'pressed',
    onClick,
    variant = 'outline',
    ...rest
  },
  ref,
) {
  const t = useToggler({ target, toggleClass, toggleAttribute, onValue, offValue, pressed, defaultPressed, onPressedChange });
  const aria =
    mode === 'expanded'
      ? { 'aria-expanded': t.pressed, 'aria-controls': t.controls }
      : { 'aria-pressed': t.pressed };
  const props = {
    variant,
    'data-state': t.pressed ? 'on' : 'off',
    ...aria,
    ...rest,
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      (onClick as ((e: MouseEvent<HTMLButtonElement>) => void) | undefined)?.(e);
      if (!e.defaultPrevented) t.toggle();
    },
  } as unknown as ButtonProps;
  return <Button ref={ref} {...props} />;
});

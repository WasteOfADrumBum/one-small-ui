import { createContext, forwardRef, useContext, type ElementType, type HTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ExtendedSize } from './types';

interface InputGroupContextValue {
  size?: ExtendedSize;
}
const InputGroupContext = createContext<InputGroupContextValue | null>(null);

/** Size inherited from a surrounding `InputGroup`. */
export const useInputGroupSize = () => useContext(InputGroupContext)?.size;

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Size for every control and add-on inside (controls can still override). */
  size?: ExtendedSize;
  /** Let the group wrap onto several lines on narrow screens. */
  wrap?: boolean;
}

/**
 * Attaches text, buttons, checkboxes and other controls to the sides of an input,
 * select, textarea or file input. Inner corners are squared automatically.
 *
 * Give the group `role="group"` and an `aria-label` (or `aria-labelledby`) when it
 * holds more than one control, so it is announced as a unit.
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { size, wrap, className, children, ...rest },
  ref,
) {
  return (
    <InputGroupContext.Provider value={{ size }}>
      <div
        ref={ref}
        className={cx(cls('input-group'), className)}
        data-size={size}
        data-wrap={wrap || undefined}
        {...rest}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  );
});

export type InputGroupTextProps = HTMLAttributes<HTMLElement> &
  Pick<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> & {
    /** Render as a `<label>` (pass `htmlFor`), or wrap a checkbox/radio so the whole add-on is its hit area. */
    as?: ElementType;
  };

/** A text or icon add-on. Use `as="label"` to label the input or to wrap a checkbox/radio. */
export const InputGroupText = forwardRef<HTMLElement, InputGroupTextProps>(function InputGroupText(
  { as: Tag = 'span', className, ...rest },
  ref,
) {
  return <Tag ref={ref} className={cx(cls('input-group__text'), className)} {...rest} />;
});

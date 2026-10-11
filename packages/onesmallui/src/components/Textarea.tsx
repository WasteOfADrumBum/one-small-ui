import { forwardRef, useCallback, useEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext, useFieldControl } from './Field';
import { useInputGroupSize } from './InputGroup';
import type { InputVariant } from './Input';
import type { ExtendedSize } from './types';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with its content up to `maxRows`. */
  autoResize?: boolean;
  maxRows?: number;
  invalid?: boolean;
  /** Show the success style. */
  valid?: boolean;
  /** Text size and padding. */
  size?: ExtendedSize;
  variant?: InputVariant;
}

/** Multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoResize, maxRows = 12, invalid, valid, size, variant = 'default', className, onInput, rows = 3, ...props },
  forwardedRef,
) {
  const field = useFieldContext();
  const groupSize = useInputGroupSize();
  const controlProps = useFieldControl(
    variant === 'plaintext' && props.readOnly === undefined ? { ...props, readOnly: true } : props,
  );
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
  const isValid = !isInvalid && (valid || field?.valid);
  const inner = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = inner.current;
    if (!el || !autoResize) return;
    el.style.height = 'auto';
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.height = `${Math.min(el.scrollHeight, line * maxRows + 24)}px`;
  }, [autoResize, maxRows]);

  useEffect(resize, [resize, props.value]);

  return (
    <textarea
      ref={(el) => {
        inner.current = el;
        if (typeof forwardedRef === 'function') forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
      }}
      rows={rows}
      className={cx(cls('textarea'), className)}
      data-auto-resize={autoResize || undefined}
      data-size={size ?? groupSize}
      data-variant={variant === 'default' ? undefined : variant}
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
      {...controlProps}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid || undefined}
      data-valid={isValid || undefined}
    />
  );
});

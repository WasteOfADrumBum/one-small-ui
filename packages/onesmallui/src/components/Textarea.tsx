import { forwardRef, useCallback, useEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldControl } from './Field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with its content up to `maxRows`. */
  autoResize?: boolean;
  maxRows?: number;
  invalid?: boolean;
}

/** Multi-line text input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { autoResize, maxRows = 12, invalid, className, onInput, rows = 3, ...props },
  forwardedRef,
) {
  const controlProps = useFieldControl(props);
  const isInvalid = invalid || (controlProps as { 'aria-invalid'?: boolean })['aria-invalid'];
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
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
      {...controlProps}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid || undefined}
    />
  );
});

import { forwardRef, Fragment, useId, useRef, type ClipboardEvent, type HTMLAttributes, type KeyboardEvent } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { useFieldContext } from './Field';
import type { Size } from './types';

export interface OtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Number of slots. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void;
  /** `numeric` (digits, numeric keypad) or `alphanumeric` (letters and digits, upper-cased). */
  type?: 'numeric' | 'alphanumeric';
  /** Hide the characters (PINs). */
  mask?: boolean;
  /** `separate` boxes (default) or `connected` slots that share borders. */
  variant?: 'separate' | 'connected';
  /** Put a separator after every n slots, e.g. `3` for "123 – 456". */
  groupSize?: number;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  /** Form field name: the whole code is submitted in one hidden input. */
  name?: string;
  /** Accessible name for the group when not inside a `Field`. */
  'aria-label'?: string;
  /** Name for each slot: `(index, length) => string`. */
  slotLabel?: (index: number, length: number) => string;
  autoFocus?: boolean;
}

/**
 * One-time code and PIN entry: one labelled group of single-character slots. Typing
 * advances, Backspace goes back, arrow keys move, pasting fills every slot, and the
 * first slot has `autocomplete="one-time-code"` so phones can offer codes from SMS.
 */
export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value,
    defaultValue = '',
    onValueChange,
    onComplete,
    type = 'numeric',
    mask,
    variant = 'separate',
    groupSize,
    size,
    disabled: disabledProp,
    invalid,
    name,
    'aria-label': ariaLabel,
    slotLabel = (i, n) => `Character ${i + 1} of ${n}`,
    autoFocus,
    className,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();
  const auto = `os-otp-${useId().replace(/:/g, '')}`;
  const [code, setCode] = useControllableState(value, defaultValue, onValueChange);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const disabled = disabledProp ?? field?.disabled;
  const isInvalid = invalid || field?.invalid;
  const allowed = type === 'numeric' ? /[0-9]/ : /[0-9a-z]/i;
  const chars = Array.from({ length }, (_, i) => code[i] ?? '');

  const clean = (s: string) =>
    Array.from(s)
      .filter((c) => allowed.test(c))
      .join('')
      .toUpperCase();

  const commit = (next: string[]) => {
    // Keep the code contiguous: no gaps before the last filled slot.
    const v = next.join('').slice(0, length);
    setCode(v);
    if (v.length === length && next.every(Boolean)) onComplete?.(v);
  };

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...chars];
      if (next[i]) next[i] = '';
      else if (i > 0) {
        next[i - 1] = '';
        focusAt(i - 1);
      }
      commit(next);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const next = [...chars];
      next.splice(i, 1);
      commit(next);
    } else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
      e.preventDefault();
      focusAt(i + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusAt(Math.min(code.length, length - 1));
    }
  };

  const onInput = (i: number, raw: string) => {
    const typed = clean(raw.replace(chars[i] ?? '', '') || raw);
    if (!typed) return;
    if (typed.length > 1) {
      // Autofill or a fast typist: spread from this slot.
      const next = [...chars];
      Array.from(typed).forEach((c, k) => {
        if (i + k < length) next[i + k] = c;
      });
      commit(next);
      focusAt(i + typed.length);
      return;
    }
    const next = [...chars];
    // Fill the first empty slot if the user skipped ahead.
    const at = Math.min(i, code.length);
    next[at] = typed;
    commit(next);
    focusAt(at + 1);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = clean(e.clipboardData.getData('text')).slice(0, length);
    if (!pasted) return;
    commit(Array.from({ length }, (_, i) => pasted[i] ?? ''));
    focusAt(pasted.length);
  };

  return (
    <div
      ref={ref}
      role="group"
      className={cx(cls('otp'), className)}
      aria-labelledby={field ? field.labelId : undefined}
      aria-label={field ? undefined : ariaLabel}
      aria-describedby={field ? [field.hintId, field.errorId].filter(Boolean).join(' ') || undefined : undefined}
      data-variant={variant}
      data-size={size ?? 'md'}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      data-complete={code.length === length || undefined}
      {...rest}
    >
      {chars.map((c, i) => (
        <Fragment key={i}>
          {groupSize && i > 0 && i % groupSize === 0 && (
            <span className={cls('otp__separator')} aria-hidden="true" />
          )}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={i === 0 ? (field?.id ?? `${auto}-0`) : `${auto}-${i}`}
            className={cls('otp__slot')}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : undefined}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={i === length - 1 ? 'done' : 'next'}
            maxLength={length}
            aria-label={slotLabel(i, length)}
            aria-invalid={isInvalid || undefined}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            data-filled={c ? true : undefined}
            value={c}
            onChange={(e) => onInput(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
          />
        </Fragment>
      ))}
      {name && <input type="hidden" name={name} value={code} />}
    </div>
  );
});

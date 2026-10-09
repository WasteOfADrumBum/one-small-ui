import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export interface TooltipProps {
  content: ReactNode;
  /** A single focusable element (button, link, input). */
  children: ReactElement<Record<string, unknown>>;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing on hover, in ms. Focus shows it immediately. */
  delay?: number;
  className?: string;
}

/**
 * A short description shown on hover and keyboard focus. Meets WCAG 1.4.13:
 * it stays while the pointer is over it and Escape dismisses it.
 * Tooltips describe; don't put essential or interactive content in them.
 */
export function Tooltip({ content, children, placement = 'top', delay = 300, className }: TooltipProps) {
  const id = `os-tip-${useId().replace(/:/g, '')}`;
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 80);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!isValidElement(children)) return children;
  const existing = children.props['aria-describedby'] as string | undefined;
  const trigger = cloneElement(children, {
    'aria-describedby': [existing, id].filter(Boolean).join(' '),
  });

  return (
    <span
      className={cx(cls('tooltip'), className)}
      data-placement={placement}
      data-state={open ? 'open' : 'closed'}
      onPointerEnter={() => show(delay)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
    >
      {trigger}
      <span role="tooltip" id={id} className={cls('tooltip__content')}>
        {content}
      </span>
    </span>
  );
}

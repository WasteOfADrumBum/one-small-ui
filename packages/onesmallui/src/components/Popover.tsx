import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import { appearanceProps, type OverlayAppearance } from './DialogBase';
import type { Placement } from './types';

export type PopoverTrigger = 'click' | 'hover' | 'focus';

export interface PopoverProps {
  /** Heading of the popover; also its accessible name. */
  title?: ReactNode;
  /** Body content. */
  content: ReactNode;
  /** One focusable element. Wrap disabled controls in `<span tabIndex={0}>`. */
  children: ReactElement<Record<string, unknown>>;
  /** What opens it. `'focus'` opens on focus and dismisses on the next click elsewhere. Combine with an array. */
  trigger?: PopoverTrigger | PopoverTrigger[];
  placement?: ResponsiveValue<Placement>;
  offset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the pointer arrow. */
  arrow?: boolean;
  /** Hover delay in ms. */
  delay?: number;
  appearance?: OverlayAppearance;
  /** Show a close button (default: when `trigger` includes `'click'`). */
  closeButton?: boolean;
  /** Accessible name when there is no `title`. */
  'aria-label'?: string;
  /** Class for the floating panel. */
  className?: string;
  style?: CSSProperties;
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (el: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r) (r as MutableRefObject<T | null>).current = el;
    }
  };
}

/**
 * Contextual content (title + body) anchored to a trigger: a non-modal dialog
 * in the top layer. Escape closes it and returns focus; clicks outside dismiss it.
 * Use it, not a tooltip, for anything interactive.
 */
export function Popover({
  title,
  content,
  children,
  trigger = 'click',
  placement = 'top',
  offset = 10,
  open,
  defaultOpen = false,
  onOpenChange,
  arrow = true,
  delay = 150,
  appearance = 'default',
  closeButton,
  'aria-label': ariaLabel,
  className,
  style,
}: PopoverProps) {
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const clickable = triggers.includes('click');
  const hoverable = triggers.includes('hover');
  const focusable = triggers.includes('focus') || hoverable;
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const id = useId().replace(/:/g, '');
  const panelId = `os-popover-${id}`;
  const titleId = `${panelId}-title`;
  const floating = useFloating<HTMLElement, HTMLDivElement>({ open: isOpen, placement, offset });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (wait = 0) => {
    clearTimeout(timer.current);
    if (wait) timer.current = setTimeout(() => setOpen(true), wait);
    else setOpen(true);
  };
  const hide = (wait = 0) => {
    clearTimeout(timer.current);
    if (wait) timer.current = setTimeout(() => setOpen(false), wait);
    else setOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const el = floating.floatingRef.current;
    if (!isOpen || !el) return;
    showInTopLayer(el);
    return () => hideFromTopLayer(el);
  }, [isOpen, floating.floatingRef]);

  // Light dismiss: a click outside the trigger and panel, or Escape anywhere.
  useEffect(() => {
    if (!isOpen) return;
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (!!floating.floatingRef.current?.contains(t) || !!floating.anchorRef.current?.contains(t));
    const onDown = (e: PointerEvent) => {
      if (!inside(e.target)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const hadFocus = inside(document.activeElement);
      setOpen(false);
      if (hadFocus) floating.anchorRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setOpen, floating.floatingRef, floating.anchorRef]);

  if (!isValidElement(children)) return children;
  const props = children.props as Record<string, unknown> & {
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    onFocus?: (e: FocusEvent<HTMLElement>) => void;
    onBlur?: (e: FocusEvent<HTMLElement>) => void;
    onPointerEnter?: (e: unknown) => void;
    onPointerLeave?: (e: unknown) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
    ref?: Ref<HTMLElement>;
  };
  const leavingTo = (e: FocusEvent<HTMLElement>) =>
    e.relatedTarget instanceof Node && !!floating.floatingRef.current?.contains(e.relatedTarget);

  const triggerEl = cloneElement(children, {
    ref: mergeRefs(floating.anchorRef, props.ref),
    ...(clickable
      ? { 'aria-haspopup': 'dialog', 'aria-expanded': isOpen, 'aria-controls': isOpen ? panelId : undefined }
      : { 'aria-describedby': [props['aria-describedby'], isOpen ? panelId : null].filter(Boolean).join(' ') || undefined }),
    onClick: (e: MouseEvent<HTMLElement>) => {
      props.onClick?.(e);
      if (clickable && !e.defaultPrevented) setOpen(!isOpen);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      props.onFocus?.(e);
      if (focusable) show();
    },
    onBlur: (e: FocusEvent<HTMLElement>) => {
      props.onBlur?.(e);
      if (focusable && !clickable && !leavingTo(e)) hide(hoverable ? 100 : 0);
    },
    onPointerEnter: (e: unknown) => {
      props.onPointerEnter?.(e);
      if (hoverable) show(delay);
    },
    onPointerLeave: (e: unknown) => {
      props.onPointerLeave?.(e);
      if (hoverable) hide(120);
    },
  });

  const withClose = closeButton ?? clickable;

  return (
    <>
      {triggerEl}
      {isOpen && (
        <div
          ref={floating.floatingRef}
          id={panelId}
          role="dialog"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : ariaLabel}
          className={cx(cls('floating'), cls('popover'), className)}
          style={style}
          data-arrow={arrow || undefined}
          {...appearanceProps(appearance)}
          onPointerEnter={hoverable ? () => clearTimeout(timer.current) : undefined}
          onPointerLeave={hoverable ? () => hide(120) : undefined}
          onBlur={
            focusable && !clickable
              ? (e) => {
                  const to = e.relatedTarget as Node | null;
                  if (!to || (!e.currentTarget.contains(to) && !floating.anchorRef.current?.contains(to))) hide();
                }
              : undefined
          }
        >
          {arrow && (
            <span
              ref={(el) => {
                floating.arrowRef.current = el;
              }}
              className={cls('floating__arrow')}
              aria-hidden="true"
            />
          )}
          {(title || withClose) && (
            <div className={cls('popover__header')}>
              {title && (
                <p id={titleId} className={cls('popover__title')}>
                  {title}
                </p>
              )}
              {withClose && (
                <CloseButton
                  label="Close"
                  onClick={() => {
                    setOpen(false);
                    floating.anchorRef.current?.focus();
                  }}
                />
              )}
            </div>
          )}
          <div className={cls('popover__body')}>{content}</div>
        </div>
      )}
    </>
  );
}

import {
  isValidElement,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { useMergedRefs } from '../hooks/useMergedRefs';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useTransition } from '../hooks/useTransition';
import { motion } from '../tokens';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { CloseButton } from './CloseButton';
import { appearanceProps, type OverlayAppearance } from './DialogBase';
import { PopoverContext, type PopoverControls } from './PopoverContext';
import type { Placement } from './types';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

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
  /** Id(s) of the element(s) that describe the panel, such as its message. */
  'aria-describedby'?: string;
  /** `'alertdialog'` for a panel that asks for a response, such as a confirmation (default `'dialog'`). */
  role?: 'dialog' | 'alertdialog';
  /** Moves focus to this element when the panel opens. Without it, focus stays on the trigger. */
  initialFocus?: RefObject<HTMLElement | null>;
  /**
   * Return focus to the trigger after an outside click too (default `false`: focus stays where the
   * user clicked). A click on another focusable control always keeps focus there.
   */
  returnFocusOnDismiss?: boolean;
  /** Class for the floating panel. */
  className?: string;
  style?: CSSProperties;
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
  'aria-describedby': ariaDescribedBy,
  role = 'dialog',
  initialFocus,
  returnFocusOnDismiss = false,
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
  // Stays mounted through a short exit animation.
  const { state, mounted } = useTransition(isOpen, { duration: motion.duration.fast });
  const { anchorRef, arrowRef, floatingRef } = useFloating<HTMLElement, HTMLDivElement>({ open: mounted, placement, offset });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Escape and the close button send focus back to the trigger; light dismiss leaves it where the user clicked.
  const { restore: returnFocus } = useFocusReturn({ active: isOpen, target: anchorRef, restoreOnDeactivate: false });
  // Set by the close path; focus moves back once the panel has actually closed (a controlled parent may refuse).
  const returnOnClose = useRef(false);
  useEffect(() => {
    if (isOpen || !returnOnClose.current) return;
    returnOnClose.current = false;
    returnFocus();
  }, [isOpen, returnFocus]);
  const refocus = useRef<() => void>(undefined);
  useEffect(() => () => refocus.current?.(), []);

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

  useIsomorphicLayoutEffect(() => {
    const el = floatingRef.current;
    if (!mounted || !el) return;
    showInTopLayer(el);
    return () => hideFromTopLayer(el);
  }, [mounted, floatingRef]);

  useIsomorphicLayoutEffect(() => {
    if (isOpen) initialFocus?.current?.focus({ preventScroll: true });
  }, [isOpen, initialFocus]);

  // Light dismiss: a click outside the trigger and panel, or Escape anywhere.
  useEffect(() => {
    if (!isOpen) return;
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (!!floatingRef.current?.contains(t) || !!anchorRef.current?.contains(t));
    const onDown = (e: PointerEvent) => {
      if (inside(e.target)) return;
      returnOnClose.current = false;
      if (returnFocusOnDismiss) refocusAfterClick();
      setOpen(false);
    };
    // The browser moves focus after pointerdown (on mousedown, or after the tap for touch). Once it
    // has, refocus the trigger only if focus was lost (a click on another control keeps it there).
    // Checked right after this event and again on the click that follows.
    const refocusAfterClick = () => {
      refocus.current?.();
      const panel = floatingRef.current;
      const run = () => {
        const a = document.activeElement;
        if (!a || a === document.body || !!panel?.contains(a)) returnFocus();
      };
      const timer = setTimeout(run, 0);
      const onClick = () => {
        stop();
        run();
      };
      const stop = () => {
        clearTimeout(timer);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('pointerdown', stop, true);
        refocus.current = undefined;
      };
      document.addEventListener('click', onClick, true);
      document.addEventListener('pointerdown', stop, true);
      refocus.current = stop;
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      returnOnClose.current = inside(document.activeElement);
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setOpen, floatingRef, anchorRef, returnFocus, returnFocusOnDismiss]);

  const childRef = isValidElement(children) ? (children.props as { ref?: Ref<HTMLElement> }).ref : undefined;
  const triggerRef = useMergedRefs(anchorRef, childRef);

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

  // JSX rather than cloneElement, so the handlers are plain props of the trigger.
  const Trigger = children.type as ElementType;
  const triggerEl = (
    <Trigger
      {...props}
      ref={triggerRef}
      {...(clickable
        ? { 'aria-haspopup': 'dialog', 'aria-expanded': isOpen, 'aria-controls': isOpen ? panelId : undefined }
        : {
            'aria-describedby':
              [props['aria-describedby'], isOpen ? panelId : null].filter(Boolean).join(' ') || undefined,
          })}
      onClick={(e: MouseEvent<HTMLElement>) => {
        props.onClick?.(e);
        if (clickable && !e.defaultPrevented) setOpen(!isOpen);
      }}
      onFocus={(e: FocusEvent<HTMLElement>) => {
        props.onFocus?.(e);
        if (focusable) show();
      }}
      onBlur={(e: FocusEvent<HTMLElement>) => {
        props.onBlur?.(e);
        // Focus moving into the panel keeps it open.
        const intoPanel = e.relatedTarget instanceof Node && !!document.getElementById(panelId)?.contains(e.relatedTarget);
        if (focusable && !clickable && !intoPanel) hide(hoverable ? 100 : 0);
      }}
      onPointerEnter={(e: unknown) => {
        props.onPointerEnter?.(e);
        if (hoverable) show(delay);
      }}
      onPointerLeave={(e: unknown) => {
        props.onPointerLeave?.(e);
        if (hoverable) hide(120);
      }}
    />
  );

  const withClose = closeButton ?? clickable;
  const controls: PopoverControls = {
    close: (refocusTrigger = true) => {
      returnOnClose.current = refocusTrigger;
      setOpen(false);
    },
  };

  return (
    <>
      {triggerEl}
      {mounted && (
        <div
          ref={floatingRef}
          id={panelId}
          role={role}
          data-state={state === 'closing' ? 'closing' : 'open'}
          // Leaving: hidden from assistive tech while it fades out.
          aria-hidden={state === 'closing' || undefined}
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : ariaLabel}
          aria-describedby={ariaDescribedBy}
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
                  if (!to || (!e.currentTarget.contains(to) && !anchorRef.current?.contains(to))) hide();
                }
              : undefined
          }
        >
          {arrow && (
            <span
              ref={(el) => {
                arrowRef.current = el;
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
                <CloseButton label="Close" onClick={() => controls.close(true)} />
              )}
            </div>
          )}
          <div className={cls('popover__body')}>
            <PopoverContext.Provider value={controls}>{content}</PopoverContext.Provider>
          </div>
        </div>
      )}
    </>
  );
}

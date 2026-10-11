import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import { useTransition, type TransitionState } from '../hooks/useTransition';
import { motion } from '../tokens';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { appearanceProps, type OverlayAppearance } from './DialogBase';
import type { Placement } from './types';

export interface TooltipProps {
  /** Short text, or rich content (formatting, icons). */
  content: ReactNode;
  /** A single focusable element (button, link, input). Wrap disabled controls in `<span tabIndex={0}>`. */
  children: ReactElement<Record<string, unknown>>;
  /** Preferred side, optionally per breakpoint. Flips when there is no room. */
  placement?: ResponsiveValue<Placement>;
  /** Delay before showing on hover, in ms. Focus shows it immediately. */
  delay?: number;
  /** Class for the wrapper around the trigger. */
  className?: string;
  /** Class for the floating tooltip. */
  contentClassName?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Lets the tooltip hold links or buttons: it stays open while focus or the
   * pointer is inside it, and is reachable with Tab. Prefer a `Popover` for this.
   */
  interactive?: boolean;
  arrow?: boolean;
  /** `'default'` is high-contrast inverted; `'dark'` and `'translucent'` match the other overlays. */
  appearance?: OverlayAppearance;
  offset?: number;
}

/** Tooltip `data-state`: `opening` shows as `open` (its CSS animates on mount). */
const tooltipState = (state: TransitionState) => (state === 'opening' ? 'open' : state);

function useTooltipState(delay: number, setOpen: (o: boolean) => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = useCallback(
    (wait: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(true), wait);
    },
    [setOpen],
  );
  const hide = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 100);
  }, [setOpen]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { show: () => show(delay), showNow: () => show(0), hide, cancel: () => clearTimeout(timer.current) };
}

/**
 * A short description shown on hover and keyboard focus, positioned in the top
 * layer with flipping. Meets WCAG 1.4.13: it stays while the pointer is over it,
 * and Escape dismisses it. Don't put essential information in a tooltip.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className,
  contentClassName,
  open,
  defaultOpen = false,
  onOpenChange,
  interactive,
  arrow = true,
  appearance = 'default',
  offset = 8,
}: TooltipProps) {
  const id = `os-tip-${useId().replace(/:/g, '')}`;
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const { state, mounted } = useTransition(isOpen, { duration: motion.duration.fast });
  const { anchorRef, arrowRef, floatingRef } = useFloating<HTMLSpanElement, HTMLSpanElement>({ open: mounted, placement, offset });
  const { show, showNow, hide, cancel } = useTooltipState(delay, setOpen);

  useLayoutEffect(() => {
    const el = floatingRef.current;
    if (!mounted || !el) return;
    showInTopLayer(el);
    return () => hideFromTopLayer(el);
  }, [mounted, floatingRef]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  if (!isValidElement(children)) return children;
  const existing = children.props['aria-describedby'] as string | undefined;
  const trigger = cloneElement(children, {
    'aria-describedby': [existing, id].filter(Boolean).join(' '),
  });

  return (
    // Presentation: wraps the trigger and listens to its bubbled hover and focus events.
    <span
      ref={anchorRef}
      role="presentation"
      className={cx(cls('tooltip'), className)}
      data-state={isOpen ? 'open' : 'closed'}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={showNow}
      onBlur={(e: FocusEvent<HTMLSpanElement>) => {
        if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
        hide();
      }}
    >
      {trigger}
      <span
        ref={floatingRef}
        role={interactive ? undefined : 'tooltip'}
        id={id}
        className={cx(cls('floating'), cls('tooltip__content'), contentClassName)}
        data-state={tooltipState(state)}
        data-interactive={interactive || undefined}
        data-tone={appearance === 'default' ? 'inverse' : undefined}
        {...appearanceProps(appearance)}
        onPointerEnter={cancel}
      >
        {content}
        {arrow && (
          <span
            ref={(el) => {
              arrowRef.current = el;
            }}
            className={cls('floating__arrow')}
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  );
}

export interface TooltipProviderProps {
  children: ReactNode;
  placement?: ResponsiveValue<Placement>;
  delay?: number;
  appearance?: OverlayAppearance;
}

/**
 * Delegated tooltips: any element inside with `data-os-tooltip="Text"` gets a
 * tooltip on hover and focus, without wrapping each one in `<Tooltip>`.
 * `data-os-tooltip-placement` overrides the side per element.
 */
export function TooltipProvider({ children, placement = 'top', delay = 300, appearance = 'default' }: TooltipProviderProps) {
  const id = `os-tip-${useId().replace(/:/g, '')}`;
  const [state, setState] = useState<{ el: HTMLElement; text: string; placement?: Placement } | null>(null);
  const open = state !== null;
  const { state: phase, mounted } = useTransition(open, { duration: motion.duration.fast });
  const { floatingRef, setAnchor } = useFloating<HTMLElement, HTMLSpanElement>({ open: mounted, placement: state?.placement ?? placement, offset: 8 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const current = useRef<HTMLElement | null>(null);

  const describe = (el: HTMLElement, on: boolean) => {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => x && x !== id);
    if (on) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const showFor = (el: HTMLElement, wait: number) => {
    clearTimeout(timer.current);
    const go = () => {
      if (current.current && current.current !== el) describe(current.current, false);
      current.current = el;
      describe(el, true);
      setAnchor(el);
      setState({
        el,
        text: el.dataset.osTooltip ?? '',
        placement: (el.dataset.osTooltipPlacement as Placement | undefined) ?? undefined,
      });
    };
    if (wait) timer.current = setTimeout(go, wait);
    else go();
  };
  const hideSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (current.current) describe(current.current, false);
      current.current = null;
      setState(null);
    }, 100);
  };

  useLayoutEffect(() => {
    const el = floatingRef.current;
    if (!mounted || !el) return;
    showInTopLayer(el);
    return () => hideFromTopLayer(el);
  }, [mounted, floatingRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') hideSoon();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const find = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('[data-os-tooltip]') : null);

  return (
    // Presentation: listens to bubbled hover and focus events from the triggers inside.
    <div
      role="presentation"
      className={cls('tooltip-provider')}
      onPointerOver={(e) => {
        const el = find(e.target);
        if (el) showFor(el, el === current.current ? 0 : delay);
      }}
      onPointerOut={(e) => {
        const el = find(e.target);
        if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) hideSoon();
      }}
      onFocus={(e) => {
        const el = find(e.target);
        if (el) showFor(el, 0);
      }}
      onBlur={(e) => {
        if (find(e.target)) hideSoon();
      }}
    >
      {children}
      <span
        ref={floatingRef}
        // Only a tooltip while it has text: an empty, nameless tooltip node is noise for assistive tech.
        role={state?.text ? 'tooltip' : undefined}
        id={id}
        className={cx(cls('floating'), cls('tooltip__content'))}
        data-state={tooltipState(phase)}
        data-tone={appearance === 'default' ? 'inverse' : undefined}
        {...appearanceProps(appearance)}
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={hideSoon}
      >
        {state?.text}
      </span>
    </div>
  );
}

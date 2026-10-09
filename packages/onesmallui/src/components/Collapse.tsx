import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { Button, type ButtonProps } from './Button';

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  ids: string[];
  register: (id: string) => () => void;
}
const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Shares open state between `CollapseTrigger`s and `Collapse` panels placed anywhere inside it.
 * Renders no element of its own. One trigger can control several panels.
 */
export function Collapsible({ open: openProp, defaultOpen = false, onOpenChange, children }: CollapsibleProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [ids, setIds] = useState<string[]>([]);
  const register = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => setIds((prev) => prev.filter((x) => x !== id));
  }, []);
  const value = useMemo(() => ({ open, setOpen, ids, register }), [open, setOpen, ids, register]);
  return <CollapsibleContext.Provider value={value}>{children}</CollapsibleContext.Provider>;
}

export interface CollapseProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled state. Inside a `Collapsible`, the shared state is used instead. */
  open?: boolean;
  /** `horizontal` animates the width instead of the height. */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Shows and hides content with a smooth size animation (no measuring). Closed content is
 * `inert`, so it leaves the tab order and the accessibility tree.
 */
export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(function Collapse(
  { open: openProp, orientation = 'vertical', id, className, children, ...rest },
  ref,
) {
  const ctx = useContext(CollapsibleContext);
  const autoId = `os-collapse-${useId().replace(/:/g, '')}`;
  const panelId = id ?? autoId;
  const open = ctx ? ctx.open : Boolean(openProp);
  const inner = useRef<HTMLDivElement | null>(null);
  const register = ctx?.register;

  useEffect(() => register?.(panelId), [register, panelId]);
  useEffect(() => {
    if (inner.current) inner.current.inert = !open;
  }, [open]);

  return (
    <div
      ref={(el) => {
        inner.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={panelId}
      className={cx(cls('collapse'), className)}
      data-state={open ? 'open' : 'closed'}
      data-orientation={orientation}
      {...rest}
    >
      <div className={cls('collapse__inner')}>{children}</div>
    </div>
  );
});

export type CollapseTriggerProps = ButtonProps & {
  /** Panel id(s) to control when used outside a `Collapsible`. */
  controls?: string;
};

/** A `Button` that toggles the panels of its `Collapsible`, with `aria-expanded` and `aria-controls` set for you. */
export const CollapseTrigger = forwardRef<HTMLButtonElement, CollapseTriggerProps>(function CollapseTrigger(
  { controls, onClick, ...rest },
  ref,
) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('<CollapseTrigger> must be inside <Collapsible>.');
  return (
    <Button
      ref={ref as never}
      aria-expanded={ctx.open}
      aria-controls={controls ?? (ctx.ids.join(' ') || undefined)}
      {...(rest as object)}
      onClick={(e: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
        ctx.setOpen(!ctx.open);
        (onClick as ((e: MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => void) | undefined)?.(e);
      }}
    />
  );
});

/** Reads the nearest `Collapsible` state, to build your own trigger. */
export function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('useCollapsible() must be used inside <Collapsible>.');
  return {
    isOpen: ctx.open,
    setOpen: ctx.setOpen,
    toggle: () => ctx.setOpen(!ctx.open),
    triggerProps: { 'aria-expanded': ctx.open, 'aria-controls': ctx.ids.join(' ') || undefined },
  };
}

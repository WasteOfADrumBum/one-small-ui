import {
  cloneElement,
  createContext,
  isValidElement,
  forwardRef,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

interface TabsContextValue {
  baseId: string;
  value: string;
  setValue: (v: string) => void;
  orientation: 'horizontal' | 'vertical';
  activation: 'automatic' | 'manual';
}
const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be inside <Tabs>.');
  return ctx;
};
const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, '_');

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  /**
   * Trigger style: `line` (glowing indicator on a track), `pill`, `underline`
   * (indicator only, no track), `list` (list-group style rows) or `button` (each tab is a button).
   */
  variant?: TabsVariant;
  /**
   * `automatic` (default): arrow keys select as they move focus.
   * `manual`: arrow keys move focus; Enter or Space selects. Use when panels are slow to render.
   */
  activation?: 'automatic' | 'manual';
  /** Fade panels in when they change. Default true. */
  fade?: boolean;
}

export type TabsVariant = 'line' | 'pill' | 'underline' | 'list' | 'button';

/** Tabs following the WAI-ARIA tabs pattern: arrow keys, Home and End move between tabs. */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'line',
  activation = 'automatic',
  fade = true,
  className,
  children,
  ...rest
}: TabsProps) {
  const baseId = `os-tabs-${useId().replace(/:/g, '')}`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  return (
    <TabsContext.Provider value={{ baseId, value: current, setValue: setCurrent, orientation, activation }}>
      <div
        className={cx(cls('tabs'), className)}
        data-orientation={orientation}
        data-variant={variant}
        data-fade={fade ? undefined : 'false'}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** Describes the tab set for screen readers. Required unless you pass `aria-labelledby`. */
  'aria-label'?: string;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ className, children, ...rest }, ref) {
  const { value, orientation, activation } = useTabs();
  const inner = useRef<HTMLDivElement | null>(null);

  // Slide the glowing indicator under the active tab.
  useLayoutEffect(() => {
    const list = inner.current;
    const active = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !active) return;
    const update = () => {
      list.style.setProperty('--os-indicator-x', `${active.offsetLeft}px`);
      list.style.setProperty('--os-indicator-y', `${active.offsetTop}px`);
      list.style.setProperty('--os-indicator-w', `${active.offsetWidth}px`);
      list.style.setProperty('--os-indicator-h', `${active.offsetHeight}px`);
    };
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(list);
    return () => ro?.disconnect();
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    let target: HTMLButtonElement | undefined;
    if (e.key === next) target = tabs[(i + 1) % tabs.length];
    else if (e.key === prev) target = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') target = tabs[0];
    else if (e.key === 'End') target = tabs[tabs.length - 1];
    if (target) {
      e.preventDefault();
      target.focus();
      if (activation === 'automatic') target.click();
    }
  };

  return (
    <div
      ref={(el) => {
        inner.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      role="tablist"
      aria-orientation={orientation}
      className={cx(cls('tabs__list'), className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
      <span className={cls('tabs__indicator')} aria-hidden="true" />
    </div>
  );
});

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
  /**
   * Render your own element (e.g. a `<Button>`) as the tab: the child receives
   * the tab's role, ids, ARIA state, tabindex and click handler.
   */
  asChild?: boolean;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, disabled, icon, asChild, className, children, onClick, ...rest },
  ref,
) {
  const { baseId, value: active, setValue } = useTabs();
  const selected = active === value;
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childClick = child.props.onClick as ((e: MouseEvent<HTMLButtonElement>) => void) | undefined;
    return cloneElement(child, {
      ref,
      role: 'tab',
      id: `${baseId}-tab-${safe(value)}`,
      'aria-selected': selected,
      'aria-controls': `${baseId}-panel-${safe(value)}`,
      tabIndex: selected ? 0 : -1,
      disabled,
      'data-state': selected ? 'active' : 'inactive',
      'data-tab': '',
      className: cx(child.props.className as string | undefined, className),
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        childClick?.(e);
        setValue(value);
        onClick?.(e);
      },
      ...rest,
    });
  }
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${safe(value)}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${safe(value)}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-state={selected ? 'active' : 'inactive'}
      className={cx(cls('tabs__tab'), className)}
      onClick={(e) => {
        setValue(value);
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the panel mounted while hidden (preserves its state). */
  keepMounted?: boolean;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, keepMounted, className, children, ...rest },
  ref,
) {
  const { baseId, value: active } = useTabs();
  const selected = active === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${baseId}-panel-${safe(value)}`}
      aria-labelledby={`${baseId}-tab-${safe(value)}`}
      tabIndex={0}
      hidden={!selected}
      data-state={selected ? 'active' : 'inactive'}
      className={cx(cls('tabs__panel'), className)}
      {...rest}
    >
      {children}
    </div>
  );
});

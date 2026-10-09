import { createContext, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

/** A custom open/closed indicator: a node (rotated 180° when open) or a render function. */
export type AccordionIndicator = ReactNode | ((open: boolean) => ReactNode);

interface AccordionContextValue {
  open: string[];
  toggle: (value: string) => void;
  setItem: (value: string, open: boolean) => void;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  native: boolean;
  name?: string;
  indicator?: AccordionIndicator;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** `single` keeps one item open at a time. */
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Heading level wrapping each trigger, to fit your page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** `default` is one bordered box, `flush` drops the outer border and radius, `spaced` separates items into cards. */
  variant?: 'default' | 'flush' | 'spaced';
  size?: 'sm' | 'md';
  /**
   * Render each item as a native `<details>` / `<summary>`. Works without JavaScript,
   * and `type="single"` uses the exclusive `name` attribute.
   */
  native?: boolean;
  /** Replace the chevron in every item. A node is rotated when open; a function gets `open` and is not rotated. */
  indicator?: AccordionIndicator;
}

/** Vertically stacked sections that expand and collapse with a smooth height animation. */
export function Accordion({
  type = 'single',
  value,
  defaultValue = [],
  onValueChange,
  headingLevel = 3,
  variant = 'default',
  size = 'md',
  native = false,
  indicator,
  className,
  children,
  ...rest
}: AccordionProps) {
  const [open, setOpen] = useControllableState(value, defaultValue, onValueChange);
  const name = `os-acc-${useId().replace(/:/g, '')}`;
  // Native <details> fire several toggle events in one tick; track the latest value between renders.
  const latest = useRef(open);
  latest.current = open;
  const setItem = (v: string, next: boolean) => {
    const cur = latest.current;
    if (cur.includes(v) === next) return;
    const updated = type === 'single' ? (next ? [v] : []) : next ? [...cur, v] : cur.filter((x) => x !== v);
    latest.current = updated;
    setOpen(updated);
  };
  const toggle = (v: string) => setItem(v, !latest.current.includes(v));
  return (
    <AccordionContext.Provider
      value={{ open, toggle, setItem, headingLevel, native, name: native && type === 'single' ? name : undefined, indicator }}
    >
      <div
        className={cx(cls('accordion'), className)}
        data-variant={variant}
        data-size={size}
        data-native={native || undefined}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string;
  title: ReactNode;
  disabled?: boolean;
  /** Overrides the accordion's `indicator` for this item. */
  indicator?: AccordionIndicator;
}

const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export function AccordionItem({ value, title, disabled, indicator, className, children, ...rest }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('<AccordionItem> must be inside <Accordion>.');
  const id = `os-acc-${useId().replace(/:/g, '')}`;
  const isOpen = ctx.open.includes(value);
  const regionRef = useRef<HTMLDivElement>(null);
  const Heading = `h${ctx.headingLevel}` as 'h3';
  const ind = indicator !== undefined ? indicator : ctx.indicator;
  const isFn = typeof ind === 'function';

  // Collapsed content stays in the DOM for the animation but is removed from
  // the tab order and accessibility tree with `inert`.
  useEffect(() => {
    if (regionRef.current && !ctx.native) regionRef.current.inert = !isOpen;
  }, [isOpen, ctx.native]);

  const indicatorEl = (
    <span className={cls('accordion__chevron')} data-static={isFn || undefined} aria-hidden="true">
      {isFn ? (ind as (open: boolean) => ReactNode)(isOpen) : (ind ?? <Chevron />)}
    </span>
  );
  const body = (
    <div className={cls('accordion__content')}>
      <div className={cls('accordion__inner')}>{children}</div>
    </div>
  );

  if (ctx.native) {
    return (
      <details
        className={cx(cls('accordion__item'), className)}
        data-state={isOpen ? 'open' : 'closed'}
        name={ctx.name}
        open={isOpen}
        onToggle={(e) => ctx.setItem(value, (e.currentTarget as HTMLDetailsElement).open)}
        {...(rest as HTMLAttributes<HTMLElement>)}
      >
        <summary
          className={cls('accordion__trigger')}
          aria-disabled={disabled || undefined}
          onClick={disabled ? (e) => e.preventDefault() : undefined}
        >
          <span>{title}</span>
          {indicatorEl}
        </summary>
        <div className={cls('accordion__region')}>{body}</div>
      </details>
    );
  }

  return (
    <div className={cx(cls('accordion__item'), className)} data-state={isOpen ? 'open' : 'closed'} {...rest}>
      <Heading className={cls('accordion__heading')}>
        <button
          type="button"
          id={`${id}-trigger`}
          className={cls('accordion__trigger')}
          aria-expanded={isOpen}
          aria-controls={`${id}-region`}
          disabled={disabled}
          onClick={() => ctx.toggle(value)}
        >
          <span>{title}</span>
          {indicatorEl}
        </button>
      </Heading>
      <div
        ref={regionRef}
        id={`${id}-region`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={cls('accordion__region')}
      >
        {body}
      </div>
    </div>
  );
}

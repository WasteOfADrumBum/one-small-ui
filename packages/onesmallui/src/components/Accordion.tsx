import { createContext, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

interface AccordionContextValue {
  open: string[];
  toggle: (value: string) => void;
  headingLevel: 2 | 3 | 4 | 5 | 6;
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
}

/** Vertically stacked sections that expand and collapse with a smooth height animation. */
export function Accordion({
  type = 'single',
  value,
  defaultValue = [],
  onValueChange,
  headingLevel = 3,
  className,
  children,
  ...rest
}: AccordionProps) {
  const [open, setOpen] = useControllableState(value, defaultValue, onValueChange);
  const toggle = (v: string) => {
    const isOpen = open.includes(v);
    if (type === 'single') setOpen(isOpen ? [] : [v]);
    else setOpen(isOpen ? open.filter((x) => x !== v) : [...open, v]);
  };
  return (
    <AccordionContext.Provider value={{ open, toggle, headingLevel }}>
      <div className={cx(cls('accordion'), className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string;
  title: ReactNode;
  disabled?: boolean;
}

export function AccordionItem({ value, title, disabled, className, children, ...rest }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('<AccordionItem> must be inside <Accordion>.');
  const id = `os-acc-${useId().replace(/:/g, '')}`;
  const isOpen = ctx.open.includes(value);
  const regionRef = useRef<HTMLDivElement>(null);
  const Heading = `h${ctx.headingLevel}` as 'h3';

  // Collapsed content stays in the DOM for the animation but is removed from
  // the tab order and accessibility tree with `inert`.
  useEffect(() => {
    if (regionRef.current) regionRef.current.inert = !isOpen;
  }, [isOpen]);

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
          <svg className={cls('accordion__chevron')} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </Heading>
      <div
        ref={regionRef}
        id={`${id}-region`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={cls('accordion__region')}
      >
        <div className={cls('accordion__content')}>
          <div className={cls('accordion__inner')}>{children}</div>
        </div>
      </div>
    </div>
  );
}

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { useResponsiveValue, type ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { ThemeColor } from './types';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

interface StepperContextValue {
  active: number;
  onStepClick?: (index: number) => void;
  statusLabels: Record<'complete' | 'error', string>;
  hideNumbers: boolean;
}
const StepperContext = createContext<StepperContextValue | null>(null);
const IndexContext = createContext<{ index: number; last: boolean }>({ index: 0, last: true });

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** Index (0-based) of the current step. Earlier steps are complete, later ones upcoming. */
  activeStep?: number;
  /** Layout direction. Accepts a responsive value: `{ base: 'vertical', md: 'horizontal' }`. */
  orientation?: ResponsiveValue<'horizontal' | 'vertical'>;
  /** Indicator style. `dot` suits timelines. */
  variant?: 'filled' | 'outline' | 'dot';
  /** Horizontal only: labels `center`ed under the indicator, or beside it at the `start`. */
  align?: 'start' | 'center';
  color?: ThemeColor;
  /** Space between steps (any CSS length). */
  gap?: string;
  /** Makes every step a button that calls this with its index (a navigable wizard). */
  onStepClick?: (index: number) => void;
  /** Screen reader text appended to completed and failed steps, for translation. */
  statusLabels?: Partial<Record<'complete' | 'error', string>>;
  /** Names the list of steps. */
  'aria-label'?: string;
}

/**
 * Step-by-step progress for wizards, checkouts and timelines. Renders an ordered list;
 * the current step has `aria-current="step"`. Horizontal steppers scroll when they overflow.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    activeStep = 0,
    orientation = 'horizontal',
    variant = 'filled',
    align = 'center',
    color = 'primary',
    gap,
    onStepClick,
    statusLabels,
    className,
    style,
    children,
    'aria-label': ariaLabel = 'Progress',
    ...rest
  },
  ref,
) {
  const dir = useResponsiveValue(orientation) ?? 'horizontal';
  const items = Children.toArray(children).filter(isValidElement);
  const scroller = useRef<HTMLDivElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  // A scrolling stepper must be reachable by keyboard (WCAG 2.1.1); only add the tab stop when it scrolls.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [dir, items.length]);

  return (
    <StepperContext.Provider
      value={{
        active: activeStep,
        onStepClick,
        statusLabels: { complete: 'completed', error: 'error', ...statusLabels },
        hideNumbers: variant === 'dot',
      }}
    >
      <div
        ref={(el) => {
          scroller.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        className={cx(cls('stepper'), className)}
        data-orientation={dir}
        data-variant={variant}
        data-align={align}
        data-color={color}
        style={gap ? ({ '--os-stepper-gap': gap, ...style } as CSSProperties) : style}
        tabIndex={overflowing ? 0 : undefined}
        role={overflowing ? 'region' : undefined}
        aria-label={overflowing ? ariaLabel : undefined}
        {...rest}
      >
        <ol className={cls('stepper__list')} aria-label={ariaLabel}>
          {items.map((child, index) => (
            <IndexContext.Provider key={child.key ?? index} value={{ index, last: index === items.length - 1 }}>
              {child}
            </IndexContext.Provider>
          ))}
        </ol>
      </div>
    </StepperContext.Provider>
  );
});

export interface StepProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  title: ReactNode;
  description?: ReactNode;
  /** Overrides the status worked out from `activeStep`. */
  status?: StepStatus;
  /** Replaces the number (or check mark) in the indicator. */
  icon?: ReactNode;
  /** Makes the step a link. */
  href?: string;
  /** Makes the step a button. */
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
}

const check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
const bang = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M12 6v8m0 4h.01" />
  </svg>
);

/** One step. Extra children render under the title and description (forms, timestamps, actions). */
export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  { title, description, status: statusProp, icon, href, onClick, disabled, className, children, ...rest },
  ref,
) {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error('<Step> must be inside <Stepper>.');
  const { index, last } = useContext(IndexContext);
  const status: StepStatus = statusProp ?? (index < ctx.active ? 'complete' : index === ctx.active ? 'current' : 'upcoming');
  const current = status === 'current' ? ('step' as const) : undefined;
  const srStatus = status === 'complete' || status === 'error' ? ctx.statusLabels[status] : undefined;

  const inner = (
    <>
      <span className={cls('stepper__indicator')} aria-hidden="true">
        {icon ?? (status === 'complete' ? check : status === 'error' ? bang : ctx.hideNumbers ? null : index + 1)}
      </span>
      <span className={cls('stepper__text')}>
        <span className={cls('stepper__title')}>
          {title}
          {srStatus && <span className={cls('sr-only')}>, {srStatus}</span>}
        </span>
        {description && <span className={cls('stepper__description')}>{description}</span>}
      </span>
    </>
  );

  const handleClick: MouseEventHandler<HTMLElement> | undefined =
    onClick || ctx.onStepClick
      ? (e) => {
          onClick?.(e);
          if (!e.defaultPrevented) ctx.onStepClick?.(index);
        }
      : undefined;

  let trigger: ReactNode;
  if (href !== undefined) {
    trigger = (
      <a
        className={cls('stepper__trigger')}
        href={disabled ? undefined : href}
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
        aria-current={current}
        onClick={disabled ? undefined : handleClick}
      >
        {inner}
      </a>
    );
  } else if (handleClick) {
    trigger = (
      <button type="button" className={cls('stepper__trigger')} disabled={disabled} aria-current={current} onClick={handleClick}>
        {inner}
      </button>
    );
  } else trigger = <div className={cls('stepper__trigger')}>{inner}</div>;

  const interactive = href !== undefined || Boolean(handleClick);
  return (
    <li
      ref={ref}
      className={cx(cls('stepper__step'), className)}
      data-status={status}
      data-last={last || undefined}
      data-interactive={interactive || undefined}
      aria-current={interactive ? undefined : current}
      {...rest}
    >
      {trigger}
      {children && <div className={cls('stepper__content')}>{children}</div>}
    </li>
  );
});

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import type { OverlayAppearance } from './DialogBase';
import { Menu, MenuContent, MenuItem, MenuSub, MenuTrigger } from './Menu';
import type { Placement } from './types';

export type NavVariant = 'links' | 'tabs' | 'pills' | 'underline';

/** Set by `Navbar` so a `Nav` inside its mobile drawer stacks vertically. */
export const NavbarCollapsedContext = createContext(false);
const MeasureContext = createContext(false);

const Chevron = () => (
  <svg className={cls('nav__chevron')} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export interface NavItemProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  href?: string;
  /** The current page: sets `aria-current` and the active style. */
  active?: boolean;
  /** Which kind of "current" this is. Default `'page'`. */
  current?: 'page' | 'location' | 'step' | 'true';
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  target?: string;
  rel?: string;
}

/** A link (with `href`) or a button in a `Nav`. */
export const NavItem = forwardRef<HTMLElement, NavItemProps>(function NavItem(
  { href, active, current = 'page', disabled, icon, onClick, target, rel, className, children, ...rest },
  ref,
) {
  const measuring = useContext(MeasureContext);
  const content = (
    <>
      {icon && (
        <span className={cls('nav__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );
  const shared = {
    className: cx(cls('nav__link'), className),
    'data-active': active || undefined,
    'data-disabled': disabled || undefined,
  };
  let el: ReactNode;
  if (measuring) el = <span {...shared}>{content}</span>;
  else if (disabled)
    el = (
      <a ref={ref as never} aria-disabled="true" {...shared} {...rest}>
        {content}
      </a>
    );
  else if (href)
    el = (
      <a
        ref={ref as never}
        href={href}
        target={target}
        rel={rel}
        aria-current={active ? current : undefined}
        onClick={onClick}
        {...shared}
        {...rest}
      >
        {content}
      </a>
    );
  else
    el = (
      <button ref={ref as never} type="button" aria-current={active ? current : undefined} onClick={onClick} {...shared} {...rest}>
        {content}
      </button>
    );
  return <li className={cls('nav__item')}>{el}</li>;
});

export interface NavMenuProps {
  label: ReactNode;
  /** `MenuItem`s, groups and dividers. */
  children: ReactNode;
  /** Highlights the trigger when the current page is inside. */
  active?: boolean;
  placement?: ResponsiveValue<Placement>;
  appearance?: OverlayAppearance;
  icon?: ReactNode;
}

/** A dropdown `Menu` as a nav item. */
export function NavMenu({ label, children, active, placement = 'bottom-start', appearance, icon }: NavMenuProps) {
  const measuring = useContext(MeasureContext);
  const inner = (
    <>
      {icon && (
        <span className={cls('nav__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
      <Chevron />
    </>
  );
  if (measuring)
    return (
      <li className={cls('nav__item')}>
        <span className={cls('nav__link')}>{inner}</span>
      </li>
    );
  return (
    <li className={cls('nav__item')}>
      <Menu placement={placement} appearance={appearance}>
        <MenuTrigger>
          <button type="button" className={cls('nav__link')} data-active={active || undefined}>
            {inner}
          </button>
        </MenuTrigger>
        <MenuContent>{children}</MenuContent>
      </Menu>
    </li>
  );
}

export interface NavProps extends HTMLAttributes<HTMLElement> {
  variant?: NavVariant;
  orientation?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  /** Items grow to fill the row, proportionally to their content. */
  fill?: boolean;
  /** Items grow to fill the row, all the same width. */
  justified?: boolean;
  /** `nav` (default) is a landmark: give it an `aria-label`. Use `div` inside a `Navbar`. */
  as?: 'nav' | 'div';
  /** Move items that don't fit into a "More" menu (horizontal only). */
  overflow?: boolean;
  /** Always show at least this many items before the "More" menu. */
  minVisible?: number;
  /** Put every item in the overflow menu. */
  collapse?: boolean;
  overflowLabel?: ReactNode;
  overflowIcon?: ReactNode;
  /** Accessible label for the overflow button when `overflowLabel` is an icon only. */
  overflowAriaLabel?: string;
}

type ItemEl = ReactElement<NavItemProps & { children?: ReactNode }>;

/**
 * Navigation links: plain, tabs, pills or underline; horizontal or vertical;
 * aligned, filled or justified. With `overflow`, items that don't fit move into a
 * "More" menu, always keeping the active item visible.
 */
export const Nav = forwardRef<HTMLElement, NavProps>(function Nav(
  {
    variant = 'links',
    orientation: orientationProp,
    align = 'start',
    fill,
    justified,
    as: Tag = 'nav',
    overflow,
    minVisible = 0,
    collapse,
    overflowLabel = 'More',
    overflowIcon,
    overflowAriaLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  const inDrawer = useContext(NavbarCollapsedContext);
  const orientation = orientationProp ?? (inDrawer ? 'vertical' : 'horizontal');
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const canOverflow = (overflow || collapse) && orientation === 'horizontal';
  const rootRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLUListElement | null>(null);
  const [count, setCount] = useState(items.length);

  useLayoutEffect(() => {
    if (!canOverflow) return;
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const run = () => {
      if (collapse) {
        setCount(0);
        return;
      }
      const lis = Array.from(measure.children) as HTMLElement[];
      const more = lis.pop();
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const widths = lis.map((li) => li.getBoundingClientRect().width);
      const available = root.clientWidth;
      const total = widths.reduce((a, w) => a + w, 0) + gap * Math.max(0, widths.length - 1);
      if (total <= available) {
        setCount(widths.length);
        return;
      }
      const moreW = (more?.getBoundingClientRect().width ?? 0) + gap;
      let used = moreW;
      let fit = 0;
      for (const w of widths) {
        if (used + w + (fit ? gap : 0) > available) break;
        used += w + (fit ? gap : 0);
        fit++;
      }
      setCount(Math.max(minVisible, fit));
    };
    run();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(run) : null;
    ro?.observe(root);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canOverflow, collapse, minVisible, items.length]);

  // Which items stay visible: the first `count`, swapping in the active one.
  const overflowable = (el: ReactElement) => el.type === NavItem || el.type === NavMenu;
  let visible = items;
  let hidden: ReactElement[] = [];
  if (canOverflow && count < items.filter(overflowable).length) {
    const order = items.map((el, i) => ({ el, i })).filter(({ el }) => overflowable(el));
    const shown = new Set(order.slice(0, count).map((o) => o.i));
    const activeIdx = order.find(({ el }) => (el.props as { active?: boolean }).active)?.i;
    if (count > 0 && activeIdx !== undefined && !shown.has(activeIdx)) {
      shown.delete(order[count - 1]!.i);
      shown.add(activeIdx);
    }
    visible = items.filter((el, i) => !overflowable(el) || shown.has(i));
    hidden = items.filter((el, i) => overflowable(el) && !shown.has(i));
  }

  const toMenuItem = (el: ReactElement, i: number) => {
    if (el.type === NavMenu) {
      const p = el.props as NavMenuProps;
      return (
        <MenuSub key={i} label={p.label} icon={p.icon}>
          {p.children}
        </MenuSub>
      );
    }
    const p = (el as ItemEl).props;
    return (
      <MenuItem key={i} href={p.href} active={p.active} disabled={p.disabled} icon={p.icon} onSelect={p.onClick}>
        {p.children}
      </MenuItem>
    );
  };

  const moreInner = (
    <>
      {overflowIcon && (
        <span className={cls('nav__icon')} aria-hidden="true">
          {overflowIcon}
        </span>
      )}
      {overflowLabel != null && <span>{overflowLabel}</span>}
      <Chevron />
    </>
  );
  const hiddenActive = hidden.some((el) => (el.props as { active?: boolean }).active);

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        rootRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={cx(cls('nav'), className)}
      data-variant={variant}
      data-orientation={orientation}
      data-align={align}
      data-fill={fill || undefined}
      data-justified={justified || undefined}
      data-overflow={canOverflow || undefined}
      {...rest}
    >
      <ul className={cls('nav__list')}>
        {visible}
        {canOverflow && hidden.length > 0 && (
          <li className={cx(cls('nav__item'), cls('nav__more'))}>
            <Menu placement="bottom-end">
              <MenuTrigger>
                <button
                  type="button"
                  className={cls('nav__link')}
                  data-active={hiddenActive || undefined}
                  aria-label={overflowAriaLabel}
                >
                  {moreInner}
                </button>
              </MenuTrigger>
              <MenuContent>{hidden.map(toMenuItem)}</MenuContent>
            </Menu>
          </li>
        )}
      </ul>
      {canOverflow && (
        <MeasureContext.Provider value={true}>
          <ul ref={measureRef} className={cx(cls('nav__list'), cls('nav__measure'))} aria-hidden="true" inert>
            {items.filter(overflowable)}
            <li className={cls('nav__item')}>
              <span className={cls('nav__link')}>{moreInner}</span>
            </li>
          </ul>
        </MeasureContext.Provider>
      )}
    </Tag>
  );
});

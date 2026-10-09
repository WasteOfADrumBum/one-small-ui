import { forwardRef, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { breakpoints, useMediaQuery, type Breakpoint } from '../hooks/useMediaQuery';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';
import { appearanceProps, type OverlayAppearance } from './DialogBase';
import { Drawer, type DrawerPlacement } from './Drawer';
import { NavbarCollapsedContext } from './Nav';
import type { ThemeColor } from './types';

export interface NavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Brand text or a logo element. */
  brand?: ReactNode;
  /** Link for the brand. Default `'/'`. Pass `null` for plain text. */
  brandHref?: string | null;
  /** Width from which `children` show inline; below it they move into a drawer behind a toggle button. */
  expand?: Exclude<Breakpoint, '3xl'> | 'always' | 'never';
  placement?: 'static' | 'sticky-top' | 'fixed-top' | 'fixed-bottom';
  appearance?: OverlayAppearance;
  /** Fill with a theme color. Text uses the matching `on-` color. */
  color?: ThemeColor;
  /** Drawer state, for controlling it from elsewhere. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Always-visible content at the end (e.g. a theme toggle), outside the collapsible part. */
  actions?: ReactNode;
  toggleLabel?: string;
  /** Title of the mobile drawer. Default `'Menu'`. */
  drawerTitle?: ReactNode;
  drawerPlacement?: DrawerPlacement;
  /** Close the drawer when a link inside it is followed. Default true. */
  closeOnNavigate?: boolean;
}

/**
 * A responsive site header: brand, navigation, forms and text. Below `expand`
 * the content collapses into a `Drawer` opened by a toggle button.
 */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  {
    brand,
    brandHref = '/',
    expand = 'lg',
    placement = 'static',
    appearance = 'default',
    color,
    open,
    defaultOpen = false,
    onOpenChange,
    actions,
    toggleLabel = 'Open navigation',
    drawerTitle = 'Menu',
    drawerPlacement = 'end',
    closeOnNavigate = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const wide = useMediaQuery(
    expand === 'always' ? 'all' : expand === 'never' ? 'not all' : `(min-width: ${breakpoints[expand]}px)`,
  );
  const id = `os-navbar-${useId().replace(/:/g, '')}`;
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <nav
      ref={ref}
      className={cx(cls('navbar'), className)}
      data-placement={placement}
      data-color={color}
      data-expanded={wide || undefined}
      {...appearanceProps(appearance)}
      {...rest}
    >
      <div className={cls('navbar__inner')}>
        {brand &&
          (brandHref === null ? (
            <span className={cls('navbar__brand')}>{brand}</span>
          ) : (
            <a className={cls('navbar__brand')} href={brandHref}>
              {brand}
            </a>
          ))}
        {wide && <div className={cls('navbar__content')}>{children}</div>}
        {actions && <div className={cls('navbar__actions')}>{actions}</div>}
        {!wide && children != null && (
          <button
            ref={toggleRef}
            type="button"
            className={cls('navbar__toggle')}
            aria-label={toggleLabel}
            aria-expanded={isOpen}
            aria-controls={isOpen ? id : undefined}
            onClick={() => setOpen(!isOpen)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        )}
      </div>
      {!wide && children != null && (
        <Drawer
          id={id}
          open={isOpen}
          onClose={() => setOpen(false)}
          title={drawerTitle}
          placement={drawerPlacement}
          size="sm"
          appearance={appearance}
          returnFocus={toggleRef}
          className={cls('navbar__drawer')}
          onClick={(e) => {
            if (closeOnNavigate && (e.target as Element).closest?.('a[href]')) setOpen(false);
          }}
        >
          <NavbarCollapsedContext.Provider value={true}>
            <div className={cls('navbar__content')}>{children}</div>
          </NavbarCollapsedContext.Provider>
        </Drawer>
      )}
    </nav>
  );
});

/** Plain text in a navbar, vertically centered. */
export function NavbarText({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(cls('navbar__text'), className)} {...rest} />;
}

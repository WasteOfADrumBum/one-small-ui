import { createContext, forwardRef, useContext, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

/** Built-in dividers, or any text or node (an SVG icon, "›", "→"). */
export type BreadcrumbSeparator = 'chevron' | 'slash' | 'dot' | 'arrow' | ReactNode;

const BreadcrumbContext = createContext<{ separator: BreadcrumbSeparator }>({ separator: 'chevron' });

const builtIn: Record<string, ReactNode> = {
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  ),
  slash: '/',
  dot: '·',
};

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Divider between items. `chevron` and `arrow` flip in right-to-left text. */
  separator?: BreadcrumbSeparator;
  /** Names the navigation landmark. */
  'aria-label'?: string;
}

/** Shows where the current page sits in the site hierarchy. Renders `nav > ol`. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator = 'chevron', className, children, 'aria-label': label = 'Breadcrumb', ...rest },
  ref,
) {
  const kind = typeof separator === 'string' && separator in builtIn ? separator : 'custom';
  return (
    <BreadcrumbContext.Provider value={{ separator }}>
      <nav ref={ref} aria-label={label} className={cx(cls('breadcrumb'), className)} data-separator={kind} {...rest}>
        <ol className={cls('breadcrumb__list')}>{children}</ol>
      </nav>
    </BreadcrumbContext.Provider>
  );
});

export interface BreadcrumbItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onClick'> {
  href?: string;
  /** Marks the current page (`aria-current="page"`). Usually the last item, rendered without a link. */
  current?: boolean;
  /** Leading icon. */
  icon?: ReactNode;
  /** Extra props for the link. */
  linkProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'];
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, current, icon, linkProps, onClick, className, children, ...rest },
  ref,
) {
  const { separator } = useContext(BreadcrumbContext);
  const sep = typeof separator === 'string' && separator in builtIn ? builtIn[separator] : separator;
  const content = (
    <>
      {icon && (
        <span className={cls('breadcrumb__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </>
  );
  return (
    <li ref={ref} className={cx(cls('breadcrumb__item'), className)} data-current={current || undefined} {...rest}>
      <span className={cls('breadcrumb__separator')} aria-hidden="true">
        {sep}
      </span>
      {href && !current ? (
        <a href={href} onClick={onClick} {...linkProps} className={cx(cls('breadcrumb__link'), linkProps?.className)}>
          {content}
        </a>
      ) : (
        <span className={cls('breadcrumb__page')} aria-current={current ? 'page' : undefined}>
          {content}
        </span>
      )}
    </li>
  );
});

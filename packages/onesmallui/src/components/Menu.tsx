import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useControllableState } from '../hooks/useControllableState';
import { useFloating } from '../hooks/useFloating';
import type { ResponsiveValue } from '../hooks/useResponsiveValue';
import { cx } from '../utils/cx';
import { hideFromTopLayer, showInTopLayer } from '../utils/position';
import { cls } from '../utils/prefix';
import { appearanceProps, type OverlayAppearance } from './DialogBase';
import type { Placement } from './types';

/** When the menu closes by itself: `true` on item select or outside click, `'inside'` only on select, `'outside'` only on outside click, `false` never. */
export type MenuAutoClose = boolean | 'inside' | 'outside';
type FocusIntent = 'first' | 'last' | null;

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean, opts?: { focus?: FocusIntent; returnFocus?: boolean }) => void;
  root: MenuContextValue | null;
  autoClose: MenuAutoClose;
  contentRole: 'menu' | 'dialog';
  appearance: OverlayAppearance;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  triggerId: string;
  contentId: string;
  focusIntent: MutableRefObject<FocusIntent>;
  isSub: boolean;
}

const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = (part: string) => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${part}> must be inside <Menu>.`);
  return ctx;
};

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (el: T | null) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r) (r as MutableRefObject<T | null>).current = el;
    }
  };
}

const ITEM = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** The enabled items that belong to this menu level (not to nested submenus). */
function itemsOf(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM)).filter(
    (el) => el.closest('[data-menu-content]') === menu && el.getAttribute('aria-disabled') !== 'true',
  );
}

const isRtl = (el: Element | null) => !!el && getComputedStyle(el).direction === 'rtl';

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where the menu opens, optionally per breakpoint. Flips when there's no room. */
  placement?: ResponsiveValue<Placement>;
  /** Gap between trigger and menu, in px. */
  offset?: number;
  autoClose?: MenuAutoClose;
  /**
   * `'menu'` (default): an APG menu of items with arrow-key navigation.
   * `'dialog'`: free-form content such as a form; Tab moves through it.
   */
  contentRole?: 'menu' | 'dialog';
  appearance?: OverlayAppearance;
  children: ReactNode;
}

/**
 * A dropdown menu following the WAI-ARIA menu button pattern. Compose with
 * `MenuTrigger`, `MenuContent` and items. Renders in the top layer, so it is
 * never clipped by `overflow` or `z-index`.
 */
export function Menu({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = 6,
  autoClose = true,
  contentRole = 'menu',
  appearance = 'default',
  children,
}: MenuProps) {
  const [isOpen, setIsOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const id = useId().replace(/:/g, '');
  const focusIntent = useRef<FocusIntent>(null);
  const floating = useFloating<HTMLElement, HTMLDivElement>({ open: isOpen, placement, offset, matchWidth: false });

  const setOpen = useCallback<MenuContextValue['setOpen']>(
    (next, opts = {}) => {
      focusIntent.current = opts.focus ?? null;
      setIsOpen(next);
      if (!next && opts.returnFocus) floating.anchorRef.current?.focus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setIsOpen],
  );

  const value = useMemo<MenuContextValue>(() => {
    const v: MenuContextValue = {
      open: isOpen,
      setOpen,
      root: null,
      autoClose,
      contentRole,
      appearance,
      triggerRef: floating.anchorRef,
      contentRef: floating.floatingRef,
      triggerId: `os-menu-${id}-trigger`,
      contentId: `os-menu-${id}`,
      focusIntent,
      isSub: false,
    };
    v.root = v;
    return v;
  }, [isOpen, setOpen, autoClose, contentRole, appearance, floating.anchorRef, floating.floatingRef, id]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export interface MenuTriggerProps {
  /** One element that can take focus, usually a `Button`. */
  children: ReactElement<Record<string, unknown>>;
}

/** Wires a button to open the menu: Enter, Space and ArrowDown open on the first item, ArrowUp on the last. */
export function MenuTrigger({ children }: MenuTriggerProps) {
  const ctx = useMenu('MenuTrigger');
  if (!isValidElement(children)) return children;
  const props = children.props as Record<string, unknown> & {
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
    ref?: Ref<HTMLElement>;
  };
  return cloneElement(children, {
    ref: mergeRefs(ctx.triggerRef, props.ref),
    id: (props.id as string) ?? ctx.triggerId,
    'aria-haspopup': ctx.contentRole === 'dialog' ? 'dialog' : 'menu',
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    'data-state': ctx.open ? 'open' : 'closed',
    onClick: (e: MouseEvent<HTMLElement>) => {
      props.onClick?.(e);
      if (e.defaultPrevented) return;
      ctx.setOpen(!ctx.open, { focus: 'first' });
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      props.onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        ctx.setOpen(true, { focus: e.key === 'ArrowDown' ? 'first' : 'last' });
      }
    },
  });
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Cap the height and scroll the items, e.g. `'16rem'`. */
  maxHeight?: string;
}

/** The floating panel. Rendered only while open. */
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { maxHeight, className, style, children, onKeyDown, ...rest },
  ref,
) {
  const ctx = useMenu('MenuContent');
  const typeahead = useRef({ text: '', at: 0 });
  const root = ctx.root ?? ctx;

  // Show in the top layer and move focus in.
  useLayoutEffect(() => {
    const el = ctx.contentRef.current;
    if (!ctx.open || !el) return;
    showInTopLayer(el);
    const intent = ctx.focusIntent.current;
    if (ctx.isSub && intent === null) {
      // Opened by hover: leave focus on the parent item.
    } else if (ctx.contentRole === 'dialog') {
      (el.querySelector<HTMLElement>('[autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus({
        preventScroll: true,
      });
    } else {
      const items = itemsOf(el);
      const target = intent === 'last' ? items[items.length - 1] : items[0];
      (target ?? el).focus({ preventScroll: true });
    }
    return () => hideFromTopLayer(el);
  }, [ctx.open, ctx.contentRef, ctx.contentRole, ctx.focusIntent]);

  // Outside clicks; focus leaving a dialog-style menu.
  useEffect(() => {
    if (!ctx.open || ctx.isSub) return;
    const closesOutside = ctx.autoClose === true || ctx.autoClose === 'outside';
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (!!ctx.contentRef.current?.contains(t) || !!ctx.triggerRef.current?.contains(t));
    const onDown = (e: PointerEvent) => {
      if (closesOutside && !inside(e.target)) ctx.setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (closesOutside && !inside(e.target)) ctx.setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('focusin', onFocus);
    };
  }, [ctx]);

  if (!ctx.open) return null;

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const menu = e.currentTarget;
    // Events from nested submenus bubble through the React tree; let each level handle its own.
    if ((e.target as Element).closest('[data-menu-content]') !== menu) return;
    const back = isRtl(menu) ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === 'Escape' || (ctx.isSub && e.key === back && ctx.contentRole === 'menu')) {
      e.preventDefault();
      e.stopPropagation();
      ctx.setOpen(false, { returnFocus: true });
      return;
    }
    if (e.key === 'Tab') {
      // Close and continue tabbing from the trigger.
      if (ctx.contentRole === 'menu') root.setOpen(false, { returnFocus: true });
      return;
    }
    if (ctx.contentRole !== 'menu') return;
    const items = itemsOf(menu);
    const i = items.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (e.key === 'ArrowDown') next = items[(i + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(i - 1 + items.length) % items.length];
    else if (e.key === 'Home' || e.key === 'PageUp') next = items[0];
    else if (e.key === 'End' || e.key === 'PageDown') next = items[items.length - 1];
    else if (e.key === ' ' && document.activeElement?.tagName === 'A') {
      e.preventDefault();
      (document.activeElement as HTMLElement).click();
      return;
    } else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typeahead: jump to the next item starting with the typed characters.
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
      t.at = now;
      const label = (el: HTMLElement) =>
        (el.querySelector('[data-menu-label]')?.textContent ?? el.textContent ?? '').trim().toLowerCase();
      const ordered = [...items.slice(i + 1), ...items.slice(0, i + 1)];
      const single = t.text.length > 1 && t.text.split('').every((c) => c === t.text[0]);
      next = ordered.find((el) => label(el).startsWith(single ? t.text[0]! : t.text));
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  return (
    <div
      ref={mergeRefs(ctx.contentRef, ref)}
      id={ctx.contentId}
      role={ctx.contentRole}
      aria-labelledby={rest['aria-label'] ? undefined : ctx.triggerId}
      tabIndex={-1}
      data-menu-content=""
      data-sub={ctx.isSub || undefined}
      className={cx(cls('floating'), cls('menu'), className)}
      style={maxHeight ? { ...style, maxHeight, overflowY: 'auto' } : style}
      onKeyDown={handleKey}
      {...appearanceProps(ctx.appearance)}
      {...rest}
    >
      {children}
    </div>
  );
});

function useItemSelect(closeOnSelect: boolean | undefined) {
  const ctx = useMenu('MenuItem');
  const root = ctx.root ?? ctx;
  return () => {
    const auto = root.autoClose === true || root.autoClose === 'inside';
    if (closeOnSelect ?? auto) root.setOpen(false, { returnFocus: true });
  };
}

interface ItemOwnProps {
  icon?: ReactNode;
  /** A second, muted line under the label. */
  description?: ReactNode;
  /** Keyboard shortcut hint shown at the end, e.g. `⌘K`. Display only. */
  shortcut?: ReactNode;
  disabled?: boolean;
  /** Overrides the menu's `autoClose` for this item. */
  closeOnSelect?: boolean;
}

function ItemContent({
  icon,
  description,
  shortcut,
  labelId,
  descId,
  children,
  indicator,
}: Pick<ItemOwnProps, 'icon' | 'description' | 'shortcut'> & {
  labelId: string;
  descId?: string;
  children: ReactNode;
  indicator?: ReactNode;
}) {
  return (
    <>
      {indicator}
      {icon && (
        <span className={cls('menu__icon')} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={cls('menu__text')}>
        <span id={labelId} className={cls('menu__label')} data-menu-label="">
          {children}
        </span>
        {description && (
          <span id={descId} className={cls('menu__description')}>
            {description}
          </span>
        )}
      </span>
      {shortcut && (
        <kbd className={cls('menu__shortcut')} aria-hidden="true">
          {shortcut}
        </kbd>
      )}
    </>
  );
}

const hover = (e: ReactPointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'touch' && document.activeElement !== e.currentTarget) e.currentTarget.focus({ preventScroll: true });
};

export interface MenuItemProps extends ItemOwnProps, Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Renders a link instead of a button. */
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: string;
  /** The current page or current choice: sets `aria-current` and highlights it. */
  active?: boolean;
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

/** An action (button) or a link in a menu. */
export const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  { href, target, rel, active, disabled, icon, description, shortcut, closeOnSelect, onSelect, onClick, className, children, ...rest },
  ref,
) {
  const select = useItemSelect(closeOnSelect);
  const id = useId().replace(/:/g, '');
  const labelId = `os-mi-${id}`;
  const descId = description ? `os-mi-${id}-d` : undefined;
  const props = {
    ref: ref as Ref<never>,
    role: 'menuitem',
    tabIndex: -1,
    className: cx(cls('menu__item'), className),
    'aria-disabled': disabled || undefined,
    'aria-current': active ? (href ? ('page' as const) : ('true' as const)) : undefined,
    'aria-labelledby': labelId,
    'aria-describedby': descId,
    'data-active': active || undefined,
    onPointerMove: hover,
    onClick: (e: MouseEvent<HTMLElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      onSelect?.(e);
      if (!e.defaultPrevented || href) select();
    },
    ...rest,
  };
  const content = (
    <ItemContent icon={icon} description={description} shortcut={shortcut} labelId={labelId} descId={descId}>
      {children}
    </ItemContent>
  );
  return href && !disabled ? (
    <a href={href} target={target} rel={rel} {...props}>
      {content}
    </a>
  ) : (
    <button type="button" {...props}>
      {content}
    </button>
  );
});

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-10" />
  </svg>
);

export interface MenuCheckboxItemProps extends ItemOwnProps, Omit<HTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** A toggleable item (`menuitemcheckbox`). Keeps the menu open by default. */
export const MenuCheckboxItem = forwardRef<HTMLButtonElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  { checked, defaultChecked = false, onCheckedChange, disabled, icon, description, shortcut, closeOnSelect = false, className, children, ...rest },
  ref,
) {
  const [on, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);
  const select = useItemSelect(closeOnSelect);
  const id = useId().replace(/:/g, '');
  return (
    <button
      ref={ref}
      type="button"
      role="menuitemcheckbox"
      aria-checked={on}
      aria-disabled={disabled || undefined}
      aria-labelledby={`os-mi-${id}`}
      aria-describedby={description ? `os-mi-${id}-d` : undefined}
      tabIndex={-1}
      className={cx(cls('menu__item'), className)}
      onPointerMove={hover}
      onClick={() => {
        if (disabled) return;
        setOn(!on);
        select();
      }}
      {...rest}
    >
      <ItemContent
        icon={icon}
        description={description}
        shortcut={shortcut}
        labelId={`os-mi-${id}`}
        descId={description ? `os-mi-${id}-d` : undefined}
        indicator={
          <span className={cls('menu__indicator')} aria-hidden="true">
            {on && <Check />}
          </span>
        }
      >
        {children}
      </ItemContent>
    </button>
  );
});

interface RadioContextValue {
  value: string;
  setValue: (v: string) => void;
}
const RadioContext = createContext<RadioContextValue | null>(null);

export interface MenuRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Visible header for the group; also its accessible name. */
  label?: ReactNode;
}

/** A set of mutually exclusive `MenuRadioItem`s. */
export function MenuRadioGroup({ value, defaultValue = '', onValueChange, label, children, ...rest }: MenuRadioGroupProps) {
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  return (
    <RadioContext.Provider value={{ value: current, setValue: setCurrent }}>
      <MenuGroup label={label} {...rest}>
        {children}
      </MenuGroup>
    </RadioContext.Provider>
  );
}

export interface MenuRadioItemProps extends ItemOwnProps, Omit<HTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value: string;
}

export const MenuRadioItem = forwardRef<HTMLButtonElement, MenuRadioItemProps>(function MenuRadioItem(
  { value, disabled, icon, description, shortcut, closeOnSelect = false, className, children, ...rest },
  ref,
) {
  const group = useContext(RadioContext);
  if (!group) throw new Error('<MenuRadioItem> must be inside <MenuRadioGroup>.');
  const select = useItemSelect(closeOnSelect);
  const id = useId().replace(/:/g, '');
  const on = group.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="menuitemradio"
      aria-checked={on}
      aria-disabled={disabled || undefined}
      aria-labelledby={`os-mi-${id}`}
      aria-describedby={description ? `os-mi-${id}-d` : undefined}
      tabIndex={-1}
      className={cx(cls('menu__item'), className)}
      onPointerMove={hover}
      onClick={() => {
        if (disabled) return;
        group.setValue(value);
        select();
      }}
      {...rest}
    >
      <ItemContent
        icon={icon}
        description={description}
        shortcut={shortcut}
        labelId={`os-mi-${id}`}
        descId={description ? `os-mi-${id}-d` : undefined}
        indicator={
          <span className={cls('menu__indicator')} data-radio="" aria-hidden="true">
            {on && <span className={cls('menu__dot')} />}
          </span>
        }
      >
        {children}
      </ItemContent>
    </button>
  );
});

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Header text; names the group for screen readers. */
  label?: ReactNode;
}

/** Groups related items under an optional header. */
export function MenuGroup({ label, className, children, ...rest }: MenuGroupProps) {
  const id = `os-mg-${useId().replace(/:/g, '')}`;
  return (
    <div role="group" aria-labelledby={label ? id : undefined} className={cx(cls('menu__group'), className)} {...rest}>
      {label && (
        <div id={id} className={cls('menu__header')} aria-hidden="true">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/** A standalone header line. Prefer `MenuGroup label` so the header also names its items. */
export function MenuHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="presentation" className={cx(cls('menu__header'), className)} {...rest} />;
}

export function MenuDivider({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cx(cls('menu__divider'), className)} {...rest} />;
}

/** Free-form content inside a menu (text, a small form). Not an item: arrow keys skip it. */
export function MenuText({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="presentation" className={cx(cls('menu__text-block'), className)} {...rest} />;
}

export interface MenuSubProps extends Omit<ItemOwnProps, 'closeOnSelect' | 'shortcut'> {
  label: ReactNode;
  /** Defaults to the inline end side (right in LTR, left in RTL). */
  placement?: ResponsiveValue<Placement>;
  /** Cap the submenu height. */
  maxHeight?: string;
  children: ReactNode;
}

/** A nested submenu. ArrowRight (ArrowLeft in RTL), Enter or hover opens it; ArrowLeft or Escape closes it. */
export function MenuSub({ label, icon, description, disabled, placement, maxHeight, children }: MenuSubProps) {
  const parent = useMenu('MenuSub');
  const root = parent.root ?? parent;
  const [open, setOpenState] = useState(false);
  const [rtl, setRtl] = useState(false);
  const id = useId().replace(/:/g, '');
  const focusIntent = useRef<FocusIntent>(null);
  const floating = useFloating<HTMLElement, HTMLDivElement>({
    open,
    placement: placement ?? (rtl ? 'left-start' : 'right-start'),
    offset: 2,
  });
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setOpen = useCallback<MenuContextValue['setOpen']>(
    (next, opts = {}) => {
      focusIntent.current = opts.focus ?? null;
      setOpenState(next);
      if (!next && opts.returnFocus) floating.anchorRef.current?.focus();
    },
    [floating.anchorRef],
  );

  // Close when focus moves to a sibling item in the parent menu.
  useEffect(() => {
    if (!open) return;
    const parentEl = parent.contentRef.current;
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Node;
      if (floating.anchorRef.current?.contains(t) || floating.floatingRef.current?.contains(t)) return;
      setOpenState(false);
    };
    parentEl?.addEventListener('focusin', onFocus);
    return () => parentEl?.removeEventListener('focusin', onFocus);
  }, [open, parent.contentRef, floating.anchorRef, floating.floatingRef]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const value = useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      root,
      autoClose: root.autoClose,
      contentRole: 'menu',
      appearance: root.appearance,
      triggerRef: floating.anchorRef,
      contentRef: floating.floatingRef,
      triggerId: `os-menu-${id}-trigger`,
      contentId: `os-menu-${id}`,
      focusIntent,
      isSub: true,
    }),
    [open, setOpen, root, floating.anchorRef, floating.floatingRef, id],
  );

  const openFrom = (el: HTMLElement, focus: FocusIntent) => {
    setRtl(isRtl(el));
    setOpen(true, { focus });
  };

  return (
    <div role="none" className={cls('menu__sub')}>
      <button
        ref={(el) => {
          floating.anchorRef.current = el;
        }}
        id={value.triggerId}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? value.contentId : undefined}
        aria-disabled={disabled || undefined}
        aria-labelledby={`os-mi-${id}`}
        aria-describedby={description ? `os-mi-${id}-d` : undefined}
        className={cls('menu__item')}
        data-state={open ? 'open' : 'closed'}
        onPointerMove={hover}
        onPointerEnter={(e) => {
          if (disabled || e.pointerType === 'touch') return;
          const el = e.currentTarget;
          clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(() => openFrom(el, null), 120);
        }}
        onPointerLeave={() => clearTimeout(hoverTimer.current)}
        onClick={(e) => {
          if (!disabled) openFrom(e.currentTarget, 'first');
        }}
        onKeyDown={(e) => {
          const forward = isRtl(e.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
          if (!disabled && e.key === forward) {
            e.preventDefault();
            e.stopPropagation();
            openFrom(e.currentTarget, 'first');
          }
        }}
      >
        <ItemContent
          icon={icon}
          description={description}
          labelId={`os-mi-${id}`}
          descId={description ? `os-mi-${id}-d` : undefined}
        >
          {label}
        </ItemContent>
        <svg className={cls('menu__chevron')} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      <MenuContext.Provider value={value}>
        <MenuContent maxHeight={maxHeight}>{children}</MenuContent>
      </MenuContext.Provider>
    </div>
  );
}

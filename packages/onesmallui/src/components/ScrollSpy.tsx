import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type RefObject } from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export type ScrollSpyRoot = HTMLElement | null | RefObject<HTMLElement | null>;

export interface UseScrollSpyOptions {
  /** Scroll container. Default: the page (viewport). */
  root?: ScrollSpyRoot;
  /**
   * Where the activation line sits, measured from the top of the root:
   * pixels (`80`) or a percentage string (`'30%'`). A section is active while it crosses the line.
   */
  offset?: number | string;
  /** Full IntersectionObserver `rootMargin` override, for custom activation bands. */
  rootMargin?: string;
  /** Turn the spy off without unmounting. */
  enabled?: boolean;
}

const resolveRoot = (root: ScrollSpyRoot | undefined): HTMLElement | null =>
  root && 'current' in root ? root.current : (root ?? null);

/** Pixel position of the activation line from the top of the root. */
export function activationLine(root: HTMLElement | null, offset: number | string): number {
  const h = root ? root.clientHeight : window.innerHeight;
  if (typeof offset === 'number') return offset;
  const n = parseFloat(offset);
  return offset.trim().endsWith('%') ? (n / 100) * h : n;
}

/**
 * Returns the id of the section currently crossing the activation line, using
 * IntersectionObserver. At the very bottom of the scroll range the last section wins.
 */
export function useScrollSpy(ids: string[], options: UseScrollSpyOptions = {}): string | null {
  const { root, offset = '30%', rootMargin, enabled = true } = options;
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('\u0000');

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    const rootEl = resolveRoot(root);
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const inBand = new Set<string>();
    let observer: IntersectionObserver | null = null;

    const atBottom = () => {
      if (rootEl) return rootEl.scrollTop + rootEl.clientHeight >= rootEl.scrollHeight - 2;
      const doc = document.documentElement;
      return window.scrollY > 0 && window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    };
    const pick = () => {
      if (atBottom()) {
        setActive(els[els.length - 1]!.id);
        return;
      }
      const first = els.find((el) => inBand.has(el.id));
      if (first) setActive(first.id);
    };
    const setup = () => {
      observer?.disconnect();
      const h = rootEl ? rootEl.clientHeight : window.innerHeight;
      const line = activationLine(rootEl, offset);
      const margin = rootMargin ?? `${-Math.round(line)}px 0px ${-Math.max(0, Math.round(h - line - 1))}px 0px`;
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const id = (e.target as HTMLElement).id;
            if (e.isIntersecting) inBand.add(id);
            else inBand.delete(id);
          }
          pick();
        },
        { root: rootEl, rootMargin: margin, threshold: 0 },
      );
      els.forEach((el) => observer!.observe(el));
    };
    setup();
    const scroller: HTMLElement | Window = rootEl ?? window;
    const onScroll = () => {
      if (atBottom()) pick();
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setup);
    return () => {
      observer?.disconnect();
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', setup);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, root, offset, rootMargin, enabled]);

  return enabled ? active : null;
}

export interface ScrollSpyProps extends HTMLAttributes<HTMLDivElement>, UseScrollSpyOptions {
  /** Show the activation line (for tuning `offset`). */
  debug?: boolean;
  /** Scroll smoothly to a section when one of the links is clicked, without changing the URL hash. Default true. */
  handleClicks?: boolean;
  /** Called when the active section changes. */
  onActiveChange?: (id: string | null) => void;
}

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Wraps any navigation (a `Nav`, a `Navbar`, a list group, plain links) and
 * marks the link whose `#hash` target is in view with `aria-current="location"`
 * and `data-active`. Parent links of nested lists get `data-active` too.
 */
export const ScrollSpy = forwardRef<HTMLDivElement, ScrollSpyProps>(function ScrollSpy(
  { root, offset = '30%', rootMargin, enabled, debug, handleClicks = true, onActiveChange, className, children, onClick, ...rest },
  ref,
) {
  const inner = useRef<HTMLDivElement | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [line, setLine] = useState<{ top: number; left: number; width: number } | null>(null);

  // Collect target ids from the links (re-read when the links change).
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const read = () => {
      const next = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
        .map((a) => decodeURIComponent(a.getAttribute('href')!.slice(1)))
        .filter((id) => id && document.getElementById(id));
      setIds((prev) => (prev.join() === next.join() ? prev : next));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { subtree: true, childList: true, attributeFilter: ['href'] });
    return () => mo.disconnect();
  }, []);

  const active = useScrollSpy(ids, { root, offset, rootMargin, enabled });

  useEffect(() => {
    onActiveChange?.(active);
    const el = inner.current;
    if (!el) return;
    el.querySelectorAll('[data-active]').forEach((a) => a.removeAttribute('data-active'));
    el.querySelectorAll('[aria-current="location"]').forEach((a) => a.removeAttribute('aria-current'));
    if (!active) return;
    const link = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).find(
      (a) => decodeURIComponent(a.getAttribute('href')!.slice(1)) === active,
    );
    if (!link) return;
    link.setAttribute('aria-current', 'location');
    link.setAttribute('data-active', '');
    // Nested navigation: mark the parent links too.
    let li = link.closest('li')?.parentElement?.closest('li');
    while (li && el.contains(li)) {
      li.querySelector(':scope > a')?.setAttribute('data-active', 'parent');
      li = li.parentElement?.closest('li');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!debug) {
      setLine(null);
      return;
    }
    const update = () => {
      const r = resolveRoot(root);
      const rect = r?.getBoundingClientRect();
      const top = (rect?.top ?? 0) + activationLine(r, offset);
      setLine({ top, left: rect?.left ?? 0, width: rect?.width ?? window.innerWidth });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [debug, root, offset]);

  return (
    <div
      ref={(el) => {
        inner.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={cx(cls('scrollspy'), className)}
      onClick={(e) => {
        onClick?.(e);
        if (!handleClicks || e.defaultPrevented) return;
        const a = (e.target as Element).closest?.('a[href^="#"]');
        const id = a && decodeURIComponent(a.getAttribute('href')!.slice(1));
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
        const r = resolveRoot(root);
        if (r) {
          const top = target.getBoundingClientRect().top - r.getBoundingClientRect().top + r.scrollTop;
          r.scrollTo({ top, behavior });
        } else {
          target.scrollIntoView({ behavior, block: 'start' });
        }
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }}
      {...rest}
    >
      {children}
      {line && (
        <div
          className={cls('scrollspy__debug')}
          aria-hidden="true"
          style={{ top: line.top, left: line.left, width: line.width }}
        >
          <span>activation line</span>
        </div>
      )}
    </div>
  );
});

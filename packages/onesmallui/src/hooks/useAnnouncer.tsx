import {
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../utils/cx';
import { cls } from '../utils/prefix';

export type Politeness = 'polite' | 'assertive';

export interface AnnounceOptions {
  /** `polite` (default) waits for the screen reader to finish; `assertive` interrupts. Use assertive for errors only. */
  politeness?: Politeness;
}

export type Announce = (message: string, options?: AnnounceOptions) => void;

const AnnouncerContext = createContext<Announce | null>(null);

// Clearing first and writing after a pause makes a repeat of the same message a
// change, so screen readers read it again.
const DELAY = 100;
const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

function write(region: HTMLElement | null | undefined, message: string) {
  if (!region) return;
  clearTimeout(timers.get(region));
  region.textContent = '';
  timers.set(
    region,
    setTimeout(() => {
      region.textContent = message;
    }, DELAY),
  );
}

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  politeness?: Politeness;
  /** Read the whole region on every change (default), not just the changed part. */
  atomic?: boolean;
  /** Render visibly instead of visually hidden. */
  visible?: boolean;
}

/** A live region: visually hidden by default, its text changes are read by screen readers. */
export const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(function LiveRegion(
  { politeness = 'polite', atomic = true, visible, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={atomic}
      className={cx(visible ? undefined : cls('sr-only'), className)}
      {...rest}
    />
  );
});

/**
 * Mounts one polite and one assertive live region for the app and provides
 * `useAnnouncer()` to every child. Mount it once, near the root.
 */
export function AnnouncerProvider({ children }: { children?: ReactNode }) {
  const polite = useRef<HTMLDivElement>(null);
  const assertive = useRef<HTMLDivElement>(null);
  const announce = useCallback<Announce>((message, { politeness = 'polite' } = {}) => {
    write(politeness === 'assertive' ? assertive.current : polite.current, message);
  }, []);
  useEffect(
    () => () => {
      [polite.current, assertive.current].forEach((r) => r && clearTimeout(timers.get(r)));
    },
    [],
  );
  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <LiveRegion ref={polite} politeness="polite" data-os-announcer="polite" />
      <LiveRegion ref={assertive} politeness="assertive" data-os-announcer="assertive" />
    </AnnouncerContext.Provider>
  );
}

// Outside a provider: one shared pair of regions, created on first use (never during render).
const fallback: Partial<Record<Politeness, HTMLElement>> = {};
function globalRegion(politeness: Politeness) {
  let el = fallback[politeness];
  if (!el || !el.isConnected) {
    el = document.createElement('div');
    el.className = cls('sr-only');
    el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('data-os-announcer', politeness);
    document.body.appendChild(el);
    fallback[politeness] = el;
  }
  return el;
}

const announceGlobally: Announce = (message, { politeness = 'polite' } = {}) => {
  if (typeof document === 'undefined') return;
  write(globalRegion(politeness), message);
};

/**
 * Returns `announce(message, { politeness })`, which reads a message to screen
 * reader users. Uses the nearest `AnnouncerProvider`, else a shared region added
 * to `<body>` on first use.
 */
export function useAnnouncer(): { announce: Announce } {
  const ctx = useContext(AnnouncerContext);
  return useMemo(() => ({ announce: ctx ?? announceGlobally }), [ctx]);
}

/** Internal: whether an `AnnouncerProvider` is above. */
export function useHasAnnouncer() {
  return useContext(AnnouncerContext) !== null;
}

/** Internal: the plain text of a React node, for announcing rich content. */
export function textContent(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textContent).filter(Boolean).join(' ');
  if (isValidElement(node)) return textContent((node.props as { children?: ReactNode }).children);
  return '';
}

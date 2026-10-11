/**
 * Shared plumbing for the vanilla (no-React) controls in `onesmallui/dom`.
 *
 * Every control is a class with `getOrCreate(element, options)`, programmatic
 * methods (`show`, `hide`, `toggle`, `dispose`, …) and DOM events:
 *   os:show / os:hide   fired before the change, cancelable with preventDefault()
 *   os:shown / os:hidden fired after the change
 * Events bubble, so you can listen on `document`.
 */

export type ControlEventName = 'show' | 'shown' | 'hide' | 'hidden' | 'change' | 'slide' | 'slid' | 'activate';

/** Dispatches `os:<name>` on the element. Returns false when a listener cancelled it. */
export function emit(el: Element, name: ControlEventName, detail: Record<string, unknown> = {}): boolean {
  const event = new CustomEvent(`os:${name}`, { bubbles: true, cancelable: true, detail });
  return el.dispatchEvent(event);
}

const registry = new WeakMap<Element, Map<string, Control>>();

export abstract class Control<E extends HTMLElement = HTMLElement> {
  static readonly NAME: string = 'control';
  readonly element: E;

  constructor(element: E) {
    this.element = element;
    let map = registry.get(element);
    if (!map) registry.set(element, (map = new Map()));
    map.set((this.constructor as typeof Control).NAME, this);
  }

  /** Removes listeners and forgets the instance. */
  dispose(): void {
    registry.get(this.element)?.delete((this.constructor as typeof Control).NAME);
  }

  static getInstance<T extends Control>(this: { NAME: string }, el: Element | null): T | null {
    if (!el) return null;
    return (registry.get(el)?.get(this.NAME) as T | undefined) ?? null;
  }
}

/** Reads `data-os-<key>` with simple type coercion: "true"/"false", numbers, JSON objects. */
export function readOption(el: Element, key: string): unknown {
  const raw = el.getAttribute(`data-os-${key}`);
  if (raw === null) return undefined;
  if (raw === '' || raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/** Resolves the element(s) a trigger controls: `data-os-target`, then `href="#id"`, then `aria-controls`. */
export function targetsOf(trigger: Element): HTMLElement[] {
  const sel =
    trigger.getAttribute('data-os-target') ??
    (trigger.getAttribute('href')?.startsWith('#') ? trigger.getAttribute('href') : null) ??
    (trigger.getAttribute('aria-controls')
      ? trigger
          .getAttribute('aria-controls')!
          .split(/\s+/)
          .map((id) => `#${CSS.escape(id)}`)
          .join(',')
      : null);
  if (!sel || sel === '#') return [];
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(sel));
  } catch {
    return [];
  }
}

/** Every trigger in the document that controls `target`. */
export function triggersFor(target: HTMLElement, kind: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-os-toggle="${kind}"]`)).filter((t) =>
    targetsOf(t).includes(target),
  );
}

let idCounter = 0;
export function ensureId(el: HTMLElement, prefix: string): string {
  if (!el.id) el.id = `os-${prefix}-${++idCounter}`;
  return el.id;
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolves after the element's CSS transition/animation ends (or immediately with no motion). */
export function afterTransition(el: HTMLElement, fallbackMs = 400): Promise<void> {
  return new Promise((resolve) => {
    const style = getComputedStyle(el);
    const longest = Math.max(
      ...`${style.transitionDuration},${style.animationDuration}`
        .split(',')
        .map((d) => (d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000) || 0),
    );
    if (!longest || prefersReducedMotion()) return resolve();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', finish);
      el.removeEventListener('animationend', finish);
      resolve();
    };
    el.addEventListener('transitionend', finish);
    el.addEventListener('animationend', finish);
    setTimeout(finish, Math.min(longest + 50, fallbackMs + longest));
  });
}

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

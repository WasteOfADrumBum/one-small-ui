const CANDIDATES = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** True when `el` is rendered: not `hidden`, `display: none`, `visibility: hidden`, or inside a closed `<details>`. */
function isRendered(el: HTMLElement, root: Element): boolean {
  if (getComputedStyle(el).visibility === 'hidden') return false;
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden || getComputedStyle(node).display === 'none') return false;
    const parent = node.parentElement;
    if (parent instanceof HTMLDetailsElement && !parent.open && !(node instanceof HTMLElement && node.tagName === 'SUMMARY')) {
      return false;
    }
    if (node === root) break;
  }
  return true;
}

/** True when `el` can receive focus from the keyboard (Tab). */
export function isTabbable(el: HTMLElement, root: Element = document.documentElement): boolean {
  if (el.tabIndex < 0) return false;
  if ((el as HTMLButtonElement).disabled || el.matches(':disabled')) return false;
  if (el.closest('[inert]')) return false;
  return isRendered(el, root);
}

/**
 * The elements inside `container` that Tab can reach, in DOM order. Skips
 * disabled, hidden, `inert` and `tabindex="-1"` elements. Queried live, so
 * elements added after mount are included.
 */
export function getFocusableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(CANDIDATES)).filter((el) => isTabbable(el, container));
}

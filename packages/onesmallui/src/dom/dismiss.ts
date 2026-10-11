import { afterTransition, emit } from './core';

/**
 * Closes the nearest dismissible ancestor:
 *   <div class="os-alert" …><button class="os-close-btn" data-os-dismiss="alert" aria-label="Dismiss">…</button></div>
 * `data-os-dismiss` names the kind (alert, toast, dialog, drawer, chip…) and matches
 * the closest `.os-<kind>` or `[data-os-<kind>]`. Dialogs are closed; anything else
 * plays its exit state (`data-state="closing"`) and is then removed, or hidden when
 * it has `data-os-keep`.
 */
export async function dismiss(el: HTMLElement): Promise<void> {
  if (el instanceof HTMLDialogElement) {
    if (!emit(el, 'hide')) return;
    el.close();
    emit(el, 'hidden');
    return;
  }
  if (!emit(el, 'hide')) return;
  el.setAttribute('data-state', 'closing');
  await afterTransition(el);
  if (el.hasAttribute('data-os-keep')) {
    el.hidden = true;
    el.removeAttribute('data-state');
  } else {
    el.remove();
  }
  emit(document.body, 'hidden', { element: el });
}

export function dismissTarget(trigger: HTMLElement): HTMLElement | null {
  const kind = trigger.getAttribute('data-os-dismiss');
  if (!kind) return null;
  const selector = /^[a-z][\w-]*$/.test(kind) ? `.os-${kind}, [data-os-${kind}]` : kind;
  return trigger.closest<HTMLElement>(selector);
}

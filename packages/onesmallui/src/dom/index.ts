/**
 * onesmallui/dom — the no-React layer. Wires `data-os-*` attributes on plain
 * HTML (using the same `os-` classes as the React components) and exposes
 * programmatic controls with events.
 *
 *   import { init } from 'onesmallui/dom';
 *   init();             // delegated listeners on document; call once
 *
 * Triggers:   data-os-toggle="collapse|dialog|drawer|menu|popover|tab|class|attr"
 *             data-os-target="#id"   (or href="#id", or aria-controls)
 * Dismiss:    data-os-dismiss="alert|toast|dialog|drawer|popover|…"
 * Tooltips:   data-os-tooltip="Text"  data-os-placement="top"
 * Scrollspy:  data-os-spy on a nav whose links point at #sections (data-os-offset="80")
 * Carousels:  data-os-carousel on .os-carousel; buttons with data-os-slide="prev|next|<index>"
 * Events:     os:show, os:shown, os:hide, os:hidden (show/hide cancelable), os:activate
 */
import type { Placement } from '../components/types';
import { autoPosition, hideFromTopLayer, showInTopLayer } from '../utils/position';
import { afterTransition, Control, emit, ensureId, FOCUSABLE, readOption, targetsOf, triggersFor } from './core';
import { dismiss, dismissTarget } from './dismiss';
import { Toggler } from './toggler';

export { Control, emit, readOption } from './core';
export { dismiss } from './dismiss';
export { Toggler } from './toggler';

const setExpanded = (target: HTMLElement, kind: string, open: boolean) => {
  for (const t of triggersFor(target, kind)) t.setAttribute('aria-expanded', String(open));
};

/** Show/hide a `.os-collapse` region. */
export class Collapse extends Control {
  static readonly NAME = 'collapse';
  static getOrCreate(el: HTMLElement) {
    return Collapse.getInstance<Collapse>(el) ?? new Collapse(el);
  }
  get isOpen() {
    return this.element.getAttribute('data-state') === 'open';
  }
  show() {
    if (this.isOpen || !emit(this.element, 'show')) return;
    this.element.setAttribute('data-state', 'open');
    this.element.inert = false;
    setExpanded(this.element, 'collapse', true);
    void afterTransition(this.element).then(() => emit(this.element, 'shown'));
  }
  hide() {
    if (!this.isOpen || !emit(this.element, 'hide')) return;
    this.element.setAttribute('data-state', 'closed');
    this.element.inert = true;
    setExpanded(this.element, 'collapse', false);
    void afterTransition(this.element).then(() => emit(this.element, 'hidden'));
  }
  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}

/** A `<dialog class="os-dialog">` or `<dialog class="os-drawer">`. */
export class Overlay extends Control<HTMLDialogElement> {
  static readonly NAME = 'overlay';
  static getOrCreate(el: HTMLDialogElement) {
    return Overlay.getInstance<Overlay>(el) ?? new Overlay(el);
  }
  constructor(el: HTMLDialogElement) {
    super(el);
    el.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (readOption(el, 'backdrop') !== 'static' && readOption(el, 'keyboard') !== false) this.hide();
    });
    el.addEventListener('click', (e) => {
      if (e.target !== el) return;
      if (readOption(el, 'backdrop') === 'static') {
        el.setAttribute('data-nudge', '');
        setTimeout(() => el.removeAttribute('data-nudge'), 300);
      } else this.hide();
    });
  }
  get isOpen() {
    return this.element.open;
  }
  show() {
    if (this.isOpen || !emit(this.element, 'show')) return;
    const modal = readOption(this.element, 'modal') !== false;
    this.element.removeAttribute('data-state');
    if (modal) {
      this.element.showModal();
      if (readOption(this.element, 'scroll') !== true) document.documentElement.classList.add('os-scroll-locked');
    } else this.element.show();
    setExpanded(this.element, this.kind, true);
    void afterTransition(this.element).then(() => emit(this.element, 'shown'));
  }
  async hide() {
    if (!this.isOpen || !emit(this.element, 'hide')) return;
    this.element.setAttribute('data-state', 'closing');
    await afterTransition(this.element.firstElementChild as HTMLElement ?? this.element);
    this.element.close();
    this.element.removeAttribute('data-state');
    if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('os-scroll-locked');
    setExpanded(this.element, this.kind, false);
    emit(this.element, 'hidden');
  }
  toggle() {
    if (this.isOpen) void this.hide();
    else this.show();
  }
  private get kind() {
    return this.element.classList.contains('os-drawer') ? 'drawer' : 'dialog';
  }
}

/**
 * A floating panel (`.os-floating.os-menu` or `.os-floating.os-popover`) anchored
 * to its trigger. Menus get arrow-key navigation and close when an item is chosen.
 * Options on the panel: data-os-placement, data-os-offset, data-os-auto-close
 * ("true" | "inside" | "outside" | "false").
 */
export class Floating extends Control {
  static readonly NAME = 'floating';
  private cleanup?: () => void;
  trigger: HTMLElement | null = null;
  static getOrCreate(el: HTMLElement) {
    return Floating.getInstance<Floating>(el) ?? new Floating(el);
  }
  get isOpen() {
    return this.element.getAttribute('data-state') === 'open';
  }
  get isMenu() {
    return this.element.classList.contains('os-menu') || this.element.getAttribute('role') === 'menu';
  }
  show(trigger?: HTMLElement | null) {
    if (this.isOpen || !emit(this.element, 'show')) return;
    this.trigger = trigger ?? this.trigger ?? triggersFor(this.element, this.isMenu ? 'menu' : 'popover')[0] ?? null;
    if (!this.trigger) return;
    for (const other of openFloating) if (other !== this && !other.element.contains(this.trigger)) other.hide(false);
    openFloating.add(this);
    this.element.hidden = false;
    showInTopLayer(this.element);
    this.element.setAttribute('data-state', 'open');
    this.cleanup = autoPosition(this.trigger, this.element, {
      placement: (readOption(this.element, 'placement') as Placement) ?? (this.isMenu ? 'bottom-start' : 'top'),
      offset: (readOption(this.element, 'offset') as number) ?? 8,
      arrow: this.element.querySelector<HTMLElement>('.os-floating__arrow'),
    });
    this.trigger.setAttribute('aria-expanded', 'true');
    if (this.isMenu) this.items()[0]?.focus();
    emit(this.element, 'shown');
  }
  hide(returnFocus = true) {
    if (!this.isOpen || !emit(this.element, 'hide')) return;
    openFloating.delete(this);
    this.cleanup?.();
    this.element.setAttribute('data-state', 'closed');
    hideFromTopLayer(this.element);
    this.element.hidden = true;
    this.trigger?.setAttribute('aria-expanded', 'false');
    if (returnFocus && this.element.contains(document.activeElement)) this.trigger?.focus();
    emit(this.element, 'hidden');
  }
  toggle(trigger?: HTMLElement) {
    if (this.isOpen) this.hide();
    else this.show(trigger);
  }
  items() {
    return Array.from(
      this.element.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"]):not([disabled])'),
    );
  }
  get autoClose() {
    return readOption(this.element, 'auto-close') ?? true;
  }
}
const openFloating = new Set<Floating>();

/** Tabs: `[role=tablist]` with `[role=tab][aria-controls]` buttons. */
export function activateTab(tab: HTMLElement) {
  const list = tab.closest<HTMLElement>('[role="tablist"]');
  if (!list || !emit(tab, 'activate')) return;
  for (const t of list.querySelectorAll<HTMLElement>('[role="tab"]')) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    t.setAttribute('data-state', on ? 'active' : 'inactive');
    for (const panel of targetsOf(t)) {
      panel.hidden = !on;
      panel.setAttribute('data-state', on ? 'active' : 'inactive');
    }
  }
  emit(tab, 'shown');
}

/** Shows a toast without React. Returns the toast element. */
export function toast(options: {
  title: string;
  description?: string;
  color?: string;
  duration?: number | null;
  placement?: string;
}): HTMLElement {
  const placement = options.placement ?? 'bottom-end';
  let viewport = document.querySelector<HTMLElement>(`.os-toast-viewport[data-placement="${placement}"]`);
  if (!viewport) {
    viewport = document.createElement('section');
    viewport.className = 'os-toast-viewport';
    viewport.dataset.placement = placement;
    viewport.setAttribute('aria-label', 'Notifications');
    viewport.innerHTML = '<ol class="os-toast-viewport__list"></ol>';
    document.body.append(viewport);
  }
  const li = document.createElement('li');
  li.className = 'os-toast';
  li.dataset.color = options.color ?? 'info';
  li.dataset.state = 'open';
  li.setAttribute('role', options.color === 'danger' ? 'alert' : 'status');
  const content = document.createElement('div');
  content.className = 'os-toast__content';
  const title = Object.assign(document.createElement('p'), { className: 'os-toast__title', textContent: options.title });
  content.append(title);
  if (options.description) content.append(Object.assign(document.createElement('p'), { className: 'os-toast__description', textContent: options.description }));
  li.innerHTML = '<span class="os-toast__accent" aria-hidden="true"></span>';
  li.append(content);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'os-close-btn';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.setAttribute('data-os-dismiss', 'toast');
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  li.append(close);
  viewport.querySelector('ol')!.append(li);
  emit(li, 'shown');
  if (options.duration) {
    let timer = setTimeout(() => dismiss(li), options.duration);
    li.addEventListener('pointerenter', () => clearTimeout(timer));
    li.addEventListener('pointerleave', () => (timer = setTimeout(() => dismiss(li), options.duration!)));
  }
  return li;
}

/** Highlights links in `nav` whose `#section` is in view. Returns a cleanup function. */
export function scrollSpy(nav: HTMLElement): () => void {
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const sections = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean) as HTMLElement[];
  const rootSel = readOption(nav, 'root');
  const root = typeof rootSel === 'string' ? document.querySelector(rootSel) : null;
  const offset = (readOption(nav, 'offset') as number) ?? 0;
  const visible = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      const current = sections.find((s) => visible.has(s));
      if (!current) return;
      for (const a of links) {
        const on = a.hash === `#${current.id}`;
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
        a.toggleAttribute('data-active', on);
      }
      emit(nav, 'activate', { id: current.id });
    },
    { root, rootMargin: `-${offset}px 0px -60% 0px` },
  );
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/** Moves a `.os-carousel` (scroll-snap track) to a slide: 'prev', 'next' or an index. */
export function slide(carousel: HTMLElement, to: 'prev' | 'next' | number) {
  const track = carousel.querySelector<HTMLElement>('.os-carousel__track');
  const slides = Array.from(carousel.querySelectorAll<HTMLElement>('.os-carousel__slide'));
  if (!track || !slides.length) return;
  const current = Number(carousel.dataset.index ?? 0);
  const end = String(readOption(carousel, 'end') ?? 'rewind');
  let next = to === 'prev' ? current - 1 : to === 'next' ? current + 1 : to;
  if (next < 0) next = end === 'stop' ? 0 : slides.length - 1;
  if (next >= slides.length) next = end === 'stop' ? slides.length - 1 : 0;
  if (!emit(carousel, 'slide', { from: current, to: next })) return;
  carousel.dataset.index = String(next);
  const target = slides[next]!;
  track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== next)));
  carousel.querySelectorAll<HTMLElement>('.os-carousel__dot').forEach((d, i) => d.toggleAttribute('data-active', i === next));
  emit(carousel, 'slid', { index: next });
}

// ---------- Delegation ----------

let tip: HTMLElement | null = null;
let tipCleanup: (() => void) | undefined;
const showTip = (el: HTMLElement) => {
  if (!tip) {
    tip = document.createElement('span');
    tip.className = 'os-floating os-tooltip__content';
    tip.setAttribute('role', 'tooltip');
    tip.dataset.tone = 'inverse';
    tip.id = 'os-dom-tooltip';
    document.body.append(tip);
  }
  tip.textContent = el.getAttribute('data-os-tooltip');
  tip.dataset.state = 'open';
  el.setAttribute('aria-describedby', tip.id);
  showInTopLayer(tip);
  tipCleanup?.();
  tipCleanup = autoPosition(el, tip, { placement: (readOption(el, 'placement') as Placement) ?? 'top' });
};
const hideTip = (el?: HTMLElement) => {
  if (!tip) return;
  tip.dataset.state = 'closed';
  tipCleanup?.();
  hideFromTopLayer(tip);
  el?.removeAttribute('aria-describedby');
};

let initialized = false;
const spies: (() => void)[] = [];

/** Turns on every data-attribute control. Safe to call more than once. */
export function init(root: Document | HTMLElement = document): void {
  root.querySelectorAll<HTMLElement>('[data-os-spy]').forEach((nav) => spies.push(scrollSpy(nav)));
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const dismissBtn = target.closest<HTMLElement>('[data-os-dismiss]');
    if (dismissBtn) {
      const el = dismissTarget(dismissBtn);
      if (el instanceof HTMLDialogElement) void Overlay.getOrCreate(el).hide();
      else if (el?.classList.contains('os-floating')) Floating.getOrCreate(el).hide();
      else if (el) void dismiss(el);
      return;
    }

    const slider = target.closest<HTMLElement>('[data-os-slide]');
    if (slider) {
      const carousel = slider.closest<HTMLElement>('.os-carousel') ?? targetsOf(slider)[0];
      const to = slider.getAttribute('data-os-slide')!;
      if (carousel) slide(carousel, to === 'prev' || to === 'next' ? to : Number(to));
      return;
    }

    // Menus close when an item is chosen (unless auto-close is false/outside).
    const item = target.closest<HTMLElement>('[role^="menuitem"]');
    const panel = item?.closest<HTMLElement>('.os-floating');
    if (item && panel) {
      const f = Floating.getInstance<Floating>(panel);
      if (f && (f.autoClose === true || f.autoClose === 'inside') && !item.hasAttribute('aria-haspopup')) f.hide();
    }

    const trigger = target.closest<HTMLElement>('[data-os-toggle]');
    if (trigger) {
      const kind = trigger.getAttribute('data-os-toggle');
      if (trigger.tagName === 'A') e.preventDefault();
      if (kind === 'class' || kind === 'attr') Toggler.getOrCreate(trigger).toggle();
      else if (kind === 'tab') activateTab(trigger);
      else
        for (const t of targetsOf(trigger)) {
          if (kind === 'collapse') Collapse.getOrCreate(t).toggle();
          else if ((kind === 'dialog' || kind === 'drawer') && t instanceof HTMLDialogElement) Overlay.getOrCreate(t).toggle();
          else if (kind === 'menu' || kind === 'popover') Floating.getOrCreate(t).toggle(trigger);
        }
    }

    // Outside clicks close floating panels.
    for (const f of [...openFloating]) {
      if (f.element.contains(target) || f.trigger?.contains(target)) continue;
      if (f.autoClose === true || f.autoClose === 'outside') f.hide(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement as HTMLElement | null;
    if (e.key === 'Escape') {
      hideTip();
      const open = [...openFloating].pop();
      if (open) {
        e.preventDefault();
        open.hide();
      }
      return;
    }
    // Menu keyboard navigation.
    const panel = active?.closest<HTMLElement>('.os-floating');
    const menu = panel && Floating.getInstance<Floating>(panel);
    if (menu?.isMenu) {
      const items = menu.items();
      const i = items.indexOf(active!);
      let to: HTMLElement | undefined;
      if (e.key === 'ArrowDown') to = items[(i + 1) % items.length];
      else if (e.key === 'ArrowUp') to = items[(i - 1 + items.length) % items.length];
      else if (e.key === 'Home') to = items[0];
      else if (e.key === 'End') to = items[items.length - 1];
      else if (e.key === 'Tab') menu.hide(false);
      if (to) {
        e.preventDefault();
        to.focus();
      }
      return;
    }
    if (active?.matches('[data-os-toggle="menu"]') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      for (const t of targetsOf(active)) Floating.getOrCreate(t).show(active);
      return;
    }
    // Tab keyboard navigation (roving tabindex).
    if (active?.matches('[data-os-toggle="tab"]')) {
      const list = active.closest('[role="tablist"]');
      const tabs = Array.from(list?.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])') ?? []);
      const vertical = list?.getAttribute('aria-orientation') === 'vertical';
      const i = tabs.indexOf(active);
      const next = vertical ? 'ArrowDown' : 'ArrowRight';
      const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
      let to: HTMLElement | undefined;
      if (e.key === next) to = tabs[(i + 1) % tabs.length];
      else if (e.key === prev) to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') to = tabs[0];
      else if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) {
        e.preventDefault();
        to.focus();
        activateTab(to);
      }
    }
  });

  const tipFrom = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('[data-os-tooltip]') : null);
  document.addEventListener('pointerover', (e) => {
    const el = tipFrom(e.target);
    if (el) showTip(el);
  });
  document.addEventListener('pointerout', (e) => {
    const el = tipFrom(e.target);
    if (el && !el.contains(e.relatedTarget as Node)) hideTip(el);
  });
  document.addEventListener('focusin', (e) => {
    const el = tipFrom(e.target);
    if (el) showTip(el);
  });
  document.addEventListener('focusout', (e) => {
    const el = tipFrom(e.target);
    if (el) hideTip(el);
  });

  // Make sure every trigger announces its state from the start.
  document.querySelectorAll<HTMLElement>('[data-os-toggle="collapse"],[data-os-toggle="menu"],[data-os-toggle="popover"]').forEach((t) => {
    const target = targetsOf(t)[0];
    if (!target) return;
    t.setAttribute('aria-controls', ensureId(target, 'ctl'));
    if (!t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', String(target.getAttribute('data-state') === 'open'));
    if (t.getAttribute('data-os-toggle') === 'menu') t.setAttribute('aria-haspopup', 'menu');
  });
}

/** Removes scrollspy observers (event delegation stays; it is cheap). */
export function destroy(): void {
  spies.splice(0).forEach((stop) => stop());
}

export { FOCUSABLE };

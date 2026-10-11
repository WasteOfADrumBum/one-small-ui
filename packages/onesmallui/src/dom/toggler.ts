import { Control, emit, readOption, targetsOf } from './core';

/**
 * Toggles a class or an attribute on one or many targets.
 *
 *   <button data-os-toggle="class" data-os-target="#panel, .cards" data-os-class="is-compact">Compact</button>
 *   <button data-os-toggle="attr" data-os-target="#page" data-os-attr="data-density" data-os-value="compact">…</button>
 *
 * The trigger gets `aria-pressed`, so it is announced as on/off.
 */
export class Toggler extends Control<HTMLElement> {
  static readonly NAME = 'toggler';

  static getOrCreate(el: HTMLElement): Toggler {
    return Toggler.getInstance<Toggler>(el) ?? new Toggler(el);
  }

  constructor(el: HTMLElement) {
    super(el);
    if (!el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', String(this.isOn()));
  }

  get targets(): HTMLElement[] {
    return targetsOf(this.element);
  }

  private get mode(): 'class' | 'attr' {
    return this.element.getAttribute('data-os-toggle') === 'attr' ? 'attr' : 'class';
  }

  isOn(): boolean {
    const first = this.targets[0];
    if (!first) return false;
    if (this.mode === 'class') return first.classList.contains(String(readOption(this.element, 'class') ?? 'is-active'));
    const attr = String(readOption(this.element, 'attr'));
    const value = readOption(this.element, 'value');
    return value === undefined ? first.hasAttribute(attr) : first.getAttribute(attr) === String(value);
  }

  toggle(force?: boolean): void {
    const on = force ?? !this.isOn();
    if (!emit(this.element, on ? 'show' : 'hide', { targets: this.targets })) return;
    for (const t of this.targets) {
      if (this.mode === 'class') {
        t.classList.toggle(String(readOption(this.element, 'class') ?? 'is-active'), on);
      } else {
        const attr = String(readOption(this.element, 'attr'));
        const value = readOption(this.element, 'value');
        const off = readOption(this.element, 'value-off');
        if (on) t.setAttribute(attr, value === undefined || value === true ? '' : String(value));
        else if (off !== undefined && off !== true) t.setAttribute(attr, String(off));
        else t.removeAttribute(attr);
      }
    }
    this.element.setAttribute('aria-pressed', String(on));
    emit(this.element, on ? 'shown' : 'hidden', { targets: this.targets });
  }
}

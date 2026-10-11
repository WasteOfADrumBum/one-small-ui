import { describe, expect, it, vi } from 'vitest';
import { Collapse, init } from '../src/dom';

describe('onesmallui/dom', () => {
  it('toggles a collapse from a data-os-toggle trigger and fires cancelable events', () => {
    document.body.innerHTML = `
      <button data-os-toggle="collapse" data-os-target="#c">More</button>
      <div class="os-collapse" id="c" data-state="closed"><div class="os-collapse__inner">Hi</div></div>`;
    init();
    const btn = document.querySelector('button')!;
    const region = document.getElementById('c')!;
    expect(btn.getAttribute('aria-controls')).toBe('c');
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    btn.click();
    expect(region.dataset.state).toBe('open');
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    const veto = vi.fn((e: Event) => e.preventDefault());
    document.addEventListener('os:hide', veto, { once: true });
    btn.click();
    expect(veto).toHaveBeenCalled();
    expect(region.dataset.state).toBe('open');

    Collapse.getOrCreate(region).hide();
    expect(region.dataset.state).toBe('closed');
    expect(region.inert).toBe(true);
  });

  it('dismisses an alert', async () => {
    document.body.innerHTML = `<div class="os-alert"><button data-os-dismiss="alert">x</button></div>`;
    init();
    document.querySelector('button')!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('.os-alert')).toBeNull();
  });
});

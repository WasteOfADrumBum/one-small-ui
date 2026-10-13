import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Kbd } from '../src/components/Kbd';
import { useHotkeys, type UseHotkeysOptions } from '../src/hooks/useHotkeys';
import { formatHotkey, isEditableTarget, matchesHotkey, parseHotkey } from '../src/utils/hotkeys';

const ev = (init: Partial<KeyboardEvent>) =>
  ({ key: '', code: '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...init }) as KeyboardEvent;

function setPlatform(platform: string) {
  Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
}

afterEach(() => setPlatform('Linux x86_64'));

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

describe('parseHotkey', () => {
  it.each([
    ['Mod+K', { mod: true, key: 'k' }],
    ['ctrl+shift+P', { ctrl: true, shift: true, key: 'p' }],
    ['Cmd+Option+Esc', { meta: true, alt: true, key: 'Escape' }],
    ['Shift+?', { shift: true, key: '?' }],
    ['Ctrl++', { ctrl: true, key: '+' }],
    ['Ctrl+Plus', { ctrl: true, key: '+' }],
    ['F10', { key: 'F10' }],
    ['shift+f10', { shift: true, key: 'F10' }],
    ['Space', { key: ' ' }],
    ['ArrowUp', { key: 'ArrowUp' }],
  ])('%s', (combo, expected) => {
    expect(parseHotkey(combo)).toEqual({ mod: false, ctrl: false, meta: false, alt: false, shift: false, ...expected });
  });
});

describe('matchesHotkey', () => {
  it('maps Mod to Meta on mac and Ctrl elsewhere', () => {
    expect(matchesHotkey(ev({ key: 'k', metaKey: true }), 'Mod+K', 'mac')).toBe(true);
    expect(matchesHotkey(ev({ key: 'k', ctrlKey: true }), 'Mod+K', 'mac')).toBe(false);
    expect(matchesHotkey(ev({ key: 'k', ctrlKey: true }), 'Mod+K', 'other')).toBe(true);
    expect(matchesHotkey(ev({ key: 'k', metaKey: true }), 'Mod+K', 'other')).toBe(false);
  });

  it('requires modifiers to match exactly', () => {
    expect(matchesHotkey(ev({ key: 'K', ctrlKey: true, shiftKey: true }), 'Mod+K', 'other')).toBe(false);
    expect(matchesHotkey(ev({ key: 'K', ctrlKey: true, shiftKey: true }), 'Mod+Shift+K', 'other')).toBe(true);
    expect(matchesHotkey(ev({ key: 'k' }), 'Mod+K', 'other')).toBe(false);
  });

  it('ignores Shift for shifted symbols unless the combo names it', () => {
    expect(matchesHotkey(ev({ key: '?', shiftKey: true }), '?')).toBe(true);
    expect(matchesHotkey(ev({ key: '?', shiftKey: true }), 'Shift+?')).toBe(true);
    expect(matchesHotkey(ev({ key: '/' }), 'Shift+/')).toBe(false);
  });

  it('falls back to the physical key when Alt changes the character', () => {
    expect(matchesHotkey(ev({ key: '˚', code: 'KeyK', altKey: true }), 'Alt+K', 'mac')).toBe(true);
  });

  it('matches named keys', () => {
    expect(matchesHotkey(ev({ key: 'F10', shiftKey: true }), 'Shift+F10')).toBe(true);
    expect(matchesHotkey(ev({ key: 'Escape' }), 'Esc')).toBe(true);
    expect(matchesHotkey(ev({ key: ' ', code: 'Space' }), 'Space')).toBe(true);
  });

  it('never matches an empty combo', () => {
    expect(matchesHotkey(ev({ key: 'Shift', shiftKey: true }), 'Shift')).toBe(false);
  });
});

describe('formatHotkey', () => {
  it('uses symbols on mac and words elsewhere, and spells keys out', () => {
    expect(formatHotkey('Mod+K', 'mac')).toEqual({ keys: ['⌘', 'K'], spoken: 'Command K' });
    expect(formatHotkey('Mod+K', 'other')).toEqual({ keys: ['Ctrl', 'K'], spoken: 'Control K' });
    expect(formatHotkey('Mod+Shift+P', 'mac')).toEqual({ keys: ['⇧', '⌘', 'P'], spoken: 'Shift Command P' });
    expect(formatHotkey('Mod+Shift+P', 'other')).toEqual({ keys: ['Ctrl', 'Shift', 'P'], spoken: 'Control Shift P' });
    expect(formatHotkey('Shift+?', 'other').spoken).toBe('Shift Question mark');
    expect(formatHotkey('Enter', 'mac')).toEqual({ keys: ['↵'], spoken: 'Enter' });
    expect(formatHotkey('ArrowDown', 'other').spoken).toBe('Down arrow');
  });

  it('does not repeat Ctrl when Mod and Ctrl are both named off mac', () => {
    expect(formatHotkey('Mod+Ctrl+K', 'other').keys).toEqual(['Ctrl', 'K']);
  });
});

describe('isEditableTarget', () => {
  it('detects text fields and contenteditable, not buttons or checkboxes', () => {
    render(
      <div>
        <input aria-label="text" />
        <input aria-label="check" type="checkbox" />
        <textarea aria-label="area" />
        <select aria-label="pick" />
        <div contentEditable suppressContentEditableWarning data-testid="ce">
          <span data-testid="inner">x</span>
        </div>
        <button type="button">Go</button>
      </div>,
    );
    expect(isEditableTarget(screen.getByLabelText('text'))).toBe(true);
    expect(isEditableTarget(screen.getByLabelText('check'))).toBe(false);
    expect(isEditableTarget(screen.getByLabelText('area'))).toBe(true);
    expect(isEditableTarget(screen.getByLabelText('pick'))).toBe(true);
    expect(isEditableTarget(screen.getByTestId('inner'))).toBe(true);
    expect(isEditableTarget(screen.getByRole('button'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

function Harness({ combo = 'Mod+K', options, onFire }: { combo?: string | string[]; options?: UseHotkeysOptions; onFire: (e: KeyboardEvent) => void }) {
  useHotkeys(combo, onFire, options);
  return (
    <div>
      <input aria-label="field" />
      <button type="button">btn</button>
    </div>
  );
}

describe('useHotkeys', () => {
  it('fires on the combo, prevents the default, and ignores others', () => {
    const onFire = vi.fn();
    render(<Harness onFire={onFire} />);
    const notPrevented = fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
    fireEvent.keyDown(document.body, { key: 'j', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 'k' });
    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('uses Meta for Mod on Apple platforms', () => {
    setPlatform('MacIntel');
    const onFire = vi.fn();
    render(<Harness onFire={onFire} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('accepts several combos', () => {
    const onFire = vi.fn();
    render(<Harness combo={['Mod+K', '/']} onFire={onFire} />);
    fireEvent.keyDown(document.body, { key: '/' });
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('ignores events from inputs unless allowInInputs', () => {
    const onFire = vi.fn();
    const { rerender } = render(<Harness onFire={onFire} />);
    fireEvent.keyDown(screen.getByLabelText('field'), { key: 'k', ctrlKey: true });
    expect(onFire).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('button'), { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
    rerender(<Harness onFire={onFire} options={{ allowInInputs: true }} />);
    fireEvent.keyDown(screen.getByLabelText('field'), { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('ignores IME composition', () => {
    const onFire = vi.fn();
    render(<Harness onFire={onFire} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true, isComposing: true });
    expect(onFire).not.toHaveBeenCalled();
  });

  it('respects enabled, preventDefault and keyup', () => {
    const onFire = vi.fn();
    const { rerender } = render(<Harness onFire={onFire} options={{ enabled: false }} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).not.toHaveBeenCalled();
    rerender(<Harness onFire={onFire} options={{ preventDefault: false }} />);
    expect(fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true })).toBe(true);
    expect(onFire).toHaveBeenCalledTimes(1);
    rerender(<Harness onFire={onFire} options={{ event: 'keyup' }} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
    fireEvent.keyUp(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('listens on a target element when given', () => {
    const onFire = vi.fn();
    function Scoped() {
      const ref = useRef<HTMLDivElement>(null);
      useHotkeys('Escape', onFire, { target: ref });
      return (
        <div ref={ref} data-testid="scope">
          <button type="button">inside</button>
        </div>
      );
    }
    render(<Scoped />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onFire).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByText('inside'), { key: 'Escape' });
    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('calls the latest handler without re-subscribing, and cleans up on unmount', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const calls: number[] = [];
    function Counter() {
      const [n, setN] = useState(0);
      useHotkeys('Mod+K', () => calls.push(n));
      return (
        <button type="button" onClick={() => setN(n + 1)}>
          inc
        </button>
      );
    }
    const { unmount } = render(<Counter />);
    const before = add.mock.calls.filter(([t]) => t === 'keydown').length;
    fireEvent.click(screen.getByText('inc'));
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(calls).toEqual([1]);
    expect(add.mock.calls.filter(([t]) => t === 'keydown').length).toBe(before);
    const remove = vi.spyOn(document, 'removeEventListener');
    unmount();
    expect(remove.mock.calls.some(([t]) => t === 'keydown')).toBe(true);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(calls).toEqual([1]);
    add.mockRestore();
    remove.mockRestore();
  });
});

describe('Kbd', () => {
  it('renders a plain key from children', () => {
    const { container } = render(<Kbd>Esc</Kbd>);
    const kbd = container.querySelector('kbd')!;
    expect(kbd).toHaveClass('os-kbd');
    expect(kbd).toHaveTextContent('Esc');
    expect(kbd.querySelector('kbd')).toBeNull();
  });

  it('renders nested keys with hidden glyphs and spoken text', () => {
    const { container } = render(<Kbd combo="Mod+K" platform="other" />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.tagName).toBe('KBD');
    expect(outer.querySelectorAll('.os-kbd__key')).toHaveLength(2);
    expect(outer.querySelector('[aria-hidden="true"]')).toHaveTextContent('CtrlK');
    expect(outer.querySelector('.os-sr-only')).toHaveTextContent('Control K');
  });

  it('detects the platform after mount', () => {
    setPlatform('MacIntel');
    render(<Kbd combo="Mod+K" data-testid="k" />);
    expect(screen.getByTestId('k')).toHaveAttribute('data-platform', 'mac');
    expect(screen.getByTestId('k').querySelector('.os-sr-only')).toHaveTextContent('Command K');
  });

  it('passes size, className and rest props through', () => {
    render(<Kbd combo="Enter" size="sm" className="x" data-testid="k" />);
    const k = screen.getByTestId('k');
    expect(k).toHaveAttribute('data-size', 'sm');
    expect(k).toHaveClass('os-kbd', 'x');
  });

  it('has no axe violations in light and dark', async () => {
    const { container } = render(
      <p>
        Press <Kbd combo="Mod+Shift+P" /> or <Kbd>Esc</Kbd>.
      </p>,
    );
    await expectNoAxeViolations(container);
  });
});

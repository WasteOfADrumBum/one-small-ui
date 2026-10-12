import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Collapse, Popover, Transition, motion } from '../src';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const panel = () => screen.getByTestId('panel');

function reduceMotion(on: boolean) {
  return vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) => ({ matches: on && query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as never,
  );
}

describe('Transition', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('steps through opening → open → closing → closed and fires callbacks', () => {
    const cb = { onEnter: vi.fn(), onEntered: vi.fn(), onExit: vi.fn(), onExited: vi.fn() };
    const { rerender } = render(
      <Transition show={false} enter="scale" {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'closed');
    expect(panel()).toHaveAttribute('hidden');
    expect(panel()).toHaveAttribute('data-enter', 'scale');
    expect(panel()).toHaveAttribute('data-leave', 'scale');
    expect(panel()).toHaveClass('os-transition');

    rerender(
      <Transition show enter="scale" {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'opening');
    expect(panel()).not.toHaveAttribute('hidden');
    expect(panel().style.getPropertyValue('--os-transition-duration')).toBe(`${motion.duration.base}ms`);
    expect(cb.onEnter).toHaveBeenCalledTimes(1);
    advance(motion.duration.base);
    expect(panel()).toHaveAttribute('data-state', 'open');
    expect(cb.onEntered).toHaveBeenCalledTimes(1);

    rerender(
      <Transition show={false} enter="scale" {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'closing');
    expect(cb.onExit).toHaveBeenCalledTimes(1);
    advance(motion.duration.base);
    expect(panel()).toHaveAttribute('data-state', 'closed');
    expect(cb.onExited).toHaveBeenCalledTimes(1);
  });

  it('unmounts on exit, appears on mount and takes custom classes and durations', () => {
    const { rerender } = render(
      <Transition show appear unmountOnExit duration={50} enter="my-in" leave="my-out">
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'opening');
    expect(panel()).toHaveClass('my-in');
    expect(panel()).not.toHaveAttribute('data-enter');
    advance(50);
    expect(panel()).not.toHaveClass('my-in');
    rerender(
      <Transition show={false} appear unmountOnExit duration={50} enter="my-in" leave="my-out">
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveClass('my-out');
    advance(50);
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('survives rapid show/hide without stale callbacks', () => {
    const onEntered = vi.fn();
    const onExited = vi.fn();
    function Demo() {
      const [show, setShow] = useState(false);
      return (
        <>
          <button onClick={() => setShow((s) => !s)}>toggle</button>
          <Transition show={show} onEntered={onEntered} onExited={onExited}>
            <div data-testid="panel">Hi</div>
          </Transition>
        </>
      );
    }
    render(<Demo />);
    const toggle = screen.getByText('toggle');
    act(() => toggle.click()); // opening
    advance(50);
    act(() => toggle.click()); // closing, mid-way
    advance(50);
    act(() => toggle.click()); // opening again
    advance(50);
    act(() => toggle.click()); // closing
    expect(panel()).toHaveAttribute('data-state', 'closing');
    advance(motion.duration.base);
    expect(panel()).toHaveAttribute('data-state', 'closed');
    expect(onEntered).not.toHaveBeenCalled();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('measures height for the collapse preset', () => {
    const { rerender } = render(
      <Transition show={false} enter="collapse">
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    Object.defineProperty(panel(), 'scrollHeight', { configurable: true, value: 120 });
    rerender(
      <Transition show enter="collapse">
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel().style.height).toBe('120px');
    advance(motion.duration.base);
    expect(panel().style.height).toBe('');
  });

  it('drops the duration to 0 under reduced motion and still fires callbacks', () => {
    const spy = reduceMotion(true);
    const cb = { onEnter: vi.fn(), onEntered: vi.fn(), onExit: vi.fn(), onExited: vi.fn() };
    const { rerender } = render(
      <Transition show={false} {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    rerender(
      <Transition show {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'open');
    expect(panel().style.getPropertyValue('--os-transition-duration')).toBe('0ms');
    expect(cb.onEnter).toHaveBeenCalledTimes(1);
    expect(cb.onEntered).toHaveBeenCalledTimes(1);
    rerender(
      <Transition show={false} {...cb}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    expect(panel()).toHaveAttribute('data-state', 'closed');
    expect(cb.onExit).toHaveBeenCalledTimes(1);
    expect(cb.onExited).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('honours data-os-motion="off" on <html>', () => {
    document.documentElement.setAttribute('data-os-motion', 'off');
    const onEntered = vi.fn();
    const { rerender } = render(
      <Transition show={false} onEntered={onEntered}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    rerender(
      <Transition show onEntered={onEntered}>
        <div data-testid="panel">Hi</div>
      </Transition>,
    );
    advance(0);
    expect(onEntered).toHaveBeenCalled();
    document.documentElement.removeAttribute('data-os-motion');
  });
});

describe('Overlays share the data-state vocabulary', () => {
  it('Collapse goes open → closing → closed and reports onExited', async () => {
    vi.useFakeTimers();
    const onEntered = vi.fn();
    const onExited = vi.fn();
    const { rerender } = render(
      <Collapse open={false} onEntered={onEntered} onExited={onExited} data-testid="panel">
        Body
      </Collapse>,
    );
    rerender(
      <Collapse open onEntered={onEntered} onExited={onExited} data-testid="panel">
        Body
      </Collapse>,
    );
    expect(panel()).toHaveAttribute('data-state', 'open');
    advance(motion.duration.slow);
    expect(onEntered).toHaveBeenCalledTimes(1);
    rerender(
      <Collapse open={false} onEntered={onEntered} onExited={onExited} data-testid="panel">
        Body
      </Collapse>,
    );
    expect(panel()).toHaveAttribute('data-state', 'closing');
    advance(motion.duration.slow);
    expect(panel()).toHaveAttribute('data-state', 'closed');
    expect(onExited).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('Popover plays a closing state, hidden from assistive tech, then unmounts', async () => {
    render(
      <Popover title="Info" content="Details">
        <Button>More</Button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    const dialog = screen.getByRole('dialog', { name: 'Info' });
    expect(dialog).toHaveAttribute('data-state', 'open');
    await userEvent.keyboard('{Escape}');
    expect(dialog).toHaveAttribute('data-state', 'closing');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // aria-hidden while leaving
    expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    await act(() => new Promise((r) => setTimeout(r, motion.duration.fast + 20)));
    expect(dialog).not.toBeInTheDocument();
  });
});

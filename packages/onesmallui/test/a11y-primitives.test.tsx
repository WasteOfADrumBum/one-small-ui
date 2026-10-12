import { useRef, useState, type ReactNode } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AnnouncerProvider,
  Button,
  Dialog,
  LiveRegion,
  Portal,
  SkipLink,
  ToastProvider,
  getFocusableElements,
  useAnnouncer,
  useFocusReturn,
  useFocusTrap,
  useReducedMotion,
  useScrollLock,
  useToast,
} from '../src';

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));
const region = (politeness: 'polite' | 'assertive') =>
  document.querySelector<HTMLElement>(`[data-os-announcer="${politeness}"]`);

function Trap({ active = true, children }: { active?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active });
  return (
    <div ref={ref} data-testid="trap">
      {children}
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus in and wraps Tab and Shift+Tab', async () => {
    render(
      <>
        <button>outside</button>
        <Trap>
          <button>one</button>
          <button>two</button>
        </Trap>
      </>,
    );
    expect(screen.getByText('one')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('two')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('one')).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByText('two')).toHaveFocus();
  });

  it('skips disabled, hidden, inert and tabindex=-1 elements and includes ones added later', async () => {
    function Dynamic() {
      const [more, setMore] = useState(false);
      return (
        <Trap>
          <button onClick={() => setMore(true)}>first</button>
          <button disabled>disabled</button>
          <button hidden>hidden</button>
          <button style={{ display: 'none' }}>none</button>
          <div inert>
            <button>inert</button>
          </div>
          <button tabIndex={-1}>minus</button>
          {more && <button>added</button>}
          <button>last</button>
        </Trap>
      );
    }
    render(<Dynamic />);
    expect(getFocusableElements(screen.getByTestId('trap')).map((b) => b.textContent)).toEqual(['first', 'last']);
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    expect(screen.getByText('added')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('last')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByText('first')).toHaveFocus();
  });

  it('lets the innermost of nested traps win, then hands back to the outer one', async () => {
    function Nested() {
      const [inner, setInner] = useState(true);
      return (
        <Trap>
          <button onClick={() => setInner(false)}>outer-a</button>
          <button>outer-b</button>
          <Trap active={inner}>
            <button>inner-a</button>
            <button>inner-b</button>
          </Trap>
        </Trap>
      );
    }
    render(<Nested />);
    screen.getByText('inner-a').focus();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByText('inner-a')).toHaveFocus();
    act(() => screen.getByText('outer-a').click());
    await wait(0);
    screen.getByText('inner-b').focus();
    await userEvent.tab();
    expect(screen.getByText('outer-a')).toHaveFocus();
  });

  it('focuses the container when it has nothing focusable, and returns focus on deactivate', async () => {
    function Toggle() {
      const [on, setOn] = useState(false);
      return (
        <>
          <button onClick={() => setOn(true)}>open</button>
          {on && (
            <Trap>
              <p onClick={() => setOn(false)} onKeyDown={() => setOn(false)} role="presentation">
                Text only
              </p>
            </Trap>
          )}
        </>
      );
    }
    render(<Toggle />);
    await userEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('trap')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByTestId('trap')).toHaveFocus();
    fireEvent.click(screen.getByText('Text only'));
    await wait(0);
    expect(screen.getByText('open')).toHaveFocus();
  });
});

describe('useFocusReturn', () => {
  function Panel({ active, fallback }: { active: boolean; fallback?: boolean }) {
    const fb = useRef<HTMLButtonElement>(null);
    useFocusReturn({ active, fallback: fallback ? fb : undefined });
    return <button ref={fb}>fallback</button>;
  }

  it('restores focus to the element focused on activation', async () => {
    const { rerender } = render(<Panel active={false} />);
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    rerender(<Panel active />);
    (document.activeElement as HTMLElement).blur();
    rerender(<Panel active={false} />);
    await wait(0);
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('falls back when the element was removed, and never steals focus moved elsewhere', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(<Panel active fallback />);
    opener.remove();
    rerender(<Panel active={false} fallback />);
    await wait(0);
    expect(screen.getByText('fallback')).toHaveFocus();

    const other = document.createElement('input');
    document.body.appendChild(other);
    rerender(<Panel active fallback />);
    other.focus();
    rerender(<Panel active={false} fallback />);
    await wait(0);
    expect(other).toHaveFocus();
    other.remove();
  });

  it('does nothing when the element was removed and there is no fallback', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(<Panel active />);
    opener.remove();
    expect(() => rerender(<Panel active={false} />)).not.toThrow();
    await wait(0);
    expect(document.body).toHaveFocus();
  });
});

describe('useScrollLock', () => {
  const html = document.documentElement;
  const setClientWidth = (w: number) => Object.defineProperty(html, 'clientWidth', { configurable: true, value: w });
  afterEach(() => {
    setClientWidth(0);
    html.style.removeProperty('--os-scrollbar-width');
  });

  it('counts nested locks and compensates the scrollbar width', () => {
    setClientWidth(window.innerWidth - 15);
    const a = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    const b = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: true } });
    expect(html).toHaveClass('os-scroll-locked');
    expect(html.style.getPropertyValue('--os-scrollbar-width')).toBe('15px');
    expect(document.body.style.paddingInlineEnd).toBe('15px');
    a.rerender({ on: false });
    expect(html).toHaveClass('os-scroll-locked');
    b.unmount();
    expect(html).not.toHaveClass('os-scroll-locked');
    expect(document.body.style.paddingInlineEnd).toBe('');
    expect(html.style.getPropertyValue('--os-scrollbar-width')).toBe('');
  });

  it('skips padding when there is no scrollbar', () => {
    setClientWidth(window.innerWidth);
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(html.style.getPropertyValue('--os-scrollbar-width')).toBe('0px');
    expect(document.body.style.paddingInlineEnd).toBe('');
    unmount();
  });

  it('pins the body on iOS Safari and restores the scroll position', () => {
    setClientWidth(window.innerWidth);
    const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('iPhone');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.position).toBe('fixed');
    unmount();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalled();
    platform.mockRestore();
    scrollTo.mockRestore();
  });
});

describe('useReducedMotion', () => {
  it('follows prefers-reduced-motion', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as never,
    );
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
    spy.mockRestore();
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);
  });
});

describe('Announcer', () => {
  function Announce({ message, politeness }: { message: string; politeness?: 'polite' | 'assertive' }) {
    const { announce } = useAnnouncer();
    return <button onClick={() => announce(message, { politeness })}>say</button>;
  }

  it('announces politely or assertively, and re-reads identical messages', async () => {
    render(
      <AnnouncerProvider>
        <Announce message="Saved" />
        <Announce message="Failed" politeness="assertive" />
      </AnnouncerProvider>,
    );
    const [polite, assertive] = screen.getAllByText('say');
    await userEvent.click(polite!);
    await wait(150);
    expect(region('polite')).toHaveTextContent('Saved');
    expect(region('polite')).toHaveAttribute('aria-live', 'polite');
    await userEvent.click(polite!);
    expect(region('polite')).toHaveTextContent(''); // cleared so the repeat is a change
    await wait(150);
    expect(region('polite')).toHaveTextContent('Saved');
    await userEvent.click(assertive!);
    await wait(150);
    expect(region('assertive')).toHaveTextContent('Failed');
    expect(region('assertive')).toHaveAttribute('aria-live', 'assertive');
  });

  it('falls back to a shared region on <body> without a provider', async () => {
    render(<Announce message="Hello" />);
    await userEvent.click(screen.getByText('say'));
    await wait(150);
    expect(region('polite')?.parentElement).toBe(document.body);
    expect(region('polite')).toHaveTextContent('Hello');
    region('polite')?.remove();
  });

  it('LiveRegion is a visually hidden status region', () => {
    render(<LiveRegion>3 results</LiveRegion>);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('os-sr-only');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('ToastProvider announcements', () => {
  function Trigger() {
    const { toast } = useToast();
    return (
      <>
        <button onClick={() => toast({ title: 'Saved', description: 'All changes stored' })}>ok</button>
        <button onClick={() => toast({ title: 'Upload failed', color: 'danger' })}>fail</button>
      </>
    );
  }

  it('mounts its own announcer when there is no AnnouncerProvider', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    expect(document.querySelectorAll('[data-os-announcer]')).toHaveLength(2);
    await userEvent.click(screen.getByText('ok'));
    await wait(150);
    expect(region('polite')).toHaveTextContent('Saved. All changes stored');
    await userEvent.click(screen.getByText('fail'));
    await wait(150);
    expect(region('assertive')).toHaveTextContent('Upload failed');
    // The toasts themselves are list items, not extra live regions.
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('uses an existing AnnouncerProvider instead of mounting another', async () => {
    render(
      <AnnouncerProvider>
        <ToastProvider>
          <Trigger />
        </ToastProvider>
      </AnnouncerProvider>,
    );
    expect(document.querySelectorAll('[data-os-announcer]')).toHaveLength(2);
    await userEvent.click(screen.getByText('ok'));
    await wait(150);
    expect(region('polite')).toHaveTextContent('Saved');
  });
});

describe('SkipLink', () => {
  it('moves focus to its target with Enter, without changing the hash', async () => {
    render(
      <>
        <SkipLink href="#content" />
        <main id="content">Main</main>
      </>,
    );
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#content');
    link.focus();
    await userEvent.keyboard('{Enter}');
    const main = screen.getByRole('main');
    expect(main).toHaveFocus();
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(window.location.hash).toBe('');
  });

  it('still accepts targetId', () => {
    render(<SkipLink targetId="app" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#app');
  });
});

describe('Portal', () => {
  it('renders into document.body or a given container', () => {
    const box = document.createElement('div');
    document.body.appendChild(box);
    const { container } = render(
      <div>
        <Portal>
          <span>in body</span>
        </Portal>
        <Portal container={box}>
          <span>in box</span>
        </Portal>
      </div>,
    );
    expect(container).not.toHaveTextContent('in body');
    expect(screen.getByText('in body').parentElement).toBe(document.body);
    expect(box).toHaveTextContent('in box');
    box.remove();
  });
});

describe('Dialog with the shared hooks', () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>open</button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Settings" animation="none">
          <Button>Save</Button>
        </Dialog>
      </>
    );
  }

  it('traps Tab, closes on Escape, unlocks scroll and returns focus', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('open'));
    expect(document.documentElement).toHaveClass('os-scroll-locked');
    const save = screen.getByRole('button', { name: 'Save' });
    const close = screen.getByRole('button', { name: 'Close dialog' });
    close.focus();
    await userEvent.tab();
    expect(save).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(save).toHaveFocus();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    await wait(0);
    expect(document.documentElement).not.toHaveClass('os-scroll-locked');
    expect(screen.getByText('open')).toHaveFocus();
  });
});

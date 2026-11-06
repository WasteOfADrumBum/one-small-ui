// Behaviour that earlier suites didn't pin down: nested overlays, Strict Mode lifecycles, counted scroll
// locks, listener cleanup, and controlled vs uncontrolled state. Observable contracts only.
import { StrictMode, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, Dialog, Drawer, Popover, Tab, TabList, TabPanel, Tabs } from '../src';

const locked = () => document.documentElement.classList.contains('os-scroll-locked');
// Closing finishes after the exit transition (instant with animation="none", but still a task later).
const settle = () => act(() => new Promise((r) => setTimeout(r, 300)));

function Nested({ onOuterClose = () => {}, onInnerClose = () => {} }) {
  const [outer, setOuter] = useState(true);
  const [inner, setInner] = useState(true);
  return (
    <Dialog
      open={outer}
      onClose={() => {
        onOuterClose();
        setOuter(false);
      }}
      title="Outer"
      animation="none"
    >
      <Dialog
        open={inner}
        onClose={() => {
          onInnerClose();
          setInner(false);
        }}
        title="Inner"
        animation="none"
      >
        inner
      </Dialog>
    </Dialog>
  );
}

describe('nested dialogs', () => {
  it('a cancel (Escape) on the inner dialog closes only the inner dialog', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(<Nested onOuterClose={outer} onInnerClose={inner} />);
    const innerDialog = screen.getByRole('dialog', { name: 'Inner' });
    fireEvent(innerDialog, new Event('cancel', { cancelable: true }));
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Outer' })).toHaveAttribute('open');
  });

  it("the inner dialog's native close event doesn't close the outer one", () => {
    const outer = vi.fn();
    render(<Nested onOuterClose={outer} />);
    fireEvent(screen.getByRole('dialog', { name: 'Inner' }), new Event('close'));
    expect(outer).not.toHaveBeenCalled();
  });
});

describe('scroll lock', () => {
  it('is counted across overlays and released when the last one closes or unmounts', async () => {
    function Two({ a, b }: { a: boolean; b: boolean }) {
      return (
        <>
          <Dialog open={a} onClose={() => {}} title="A" animation="none">
            a
          </Dialog>
          <Drawer open={b} onClose={() => {}} title="B">
            b
          </Drawer>
        </>
      );
    }
    const { rerender, unmount } = render(<Two a b />);
    expect(locked()).toBe(true);
    rerender(<Two a={false} b />);
    await settle();
    expect(locked()).toBe(true);
    rerender(<Two a={false} b={false} />);
    await settle();
    expect(locked()).toBe(false);
    rerender(<Two a b={false} />);
    expect(locked()).toBe(true);
    unmount();
    expect(locked()).toBe(false);
  });
});

describe('Strict Mode', () => {
  it('a dialog opens, traps, closes and returns focus with effects run twice', async () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Strict" animation="none">
            <button>inside</button>
          </Dialog>
        </>
      );
    }
    render(
      <StrictMode>
        <Demo />
      </StrictMode>,
    );
    const trigger = screen.getByText('open');
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Strict' })).toHaveAttribute('open');
    expect(locked()).toBe(true);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    await settle();
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
    expect(locked()).toBe(false);
    expect(trigger).toHaveFocus();
  });

  it('a popover opens and closes with Escape', async () => {
    render(
      <StrictMode>
        <Popover title="Info" content="Body">
          <button>More</button>
        </Popover>
      </StrictMode>,
    );
    await userEvent.click(screen.getByText('More'));
    expect(screen.getByRole('dialog', { name: 'Info' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('listener cleanup', () => {
  it('an open popover removes every document listener it added when it unmounts', async () => {
    const added = new Map<string, number>();
    const add = vi.spyOn(document, 'addEventListener').mockImplementation(function (this: Document, type: string, ...rest: unknown[]) {
      added.set(type, (added.get(type) ?? 0) + 1);
      return EventTarget.prototype.addEventListener.call(this, type, ...(rest as [EventListener]));
    } as typeof document.addEventListener);
    const remove = vi.spyOn(document, 'removeEventListener').mockImplementation(function (this: Document, type: string, ...rest: unknown[]) {
      added.set(type, (added.get(type) ?? 0) - 1);
      return EventTarget.prototype.removeEventListener.call(this, type, ...(rest as [EventListener]));
    } as typeof document.removeEventListener);
    try {
      const { unmount } = render(
        <Popover title="Info" content="Body" defaultOpen>
          <button>More</button>
        </Popover>,
      );
      expect(screen.getByRole('dialog', { name: 'Info' })).toBeInTheDocument();
      unmount();
      const leaked = [...added].filter(([, n]) => n > 0);
      expect(leaked).toEqual([]);
    } finally {
      add.mockRestore();
      remove.mockRestore();
    }
  });
});

describe('controlled and uncontrolled state', () => {
  it('controlled Tabs follow the value prop and report changes', async () => {
    const onValueChange = vi.fn();
    function Demo({ value }: { value: string }) {
      return (
        <Tabs defaultValue="a" value={value} onValueChange={onValueChange}>
          <TabList aria-label="Demo">
            <Tab value="a">A</Tab>
            <Tab value="b">B</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </Tabs>
      );
    }
    const { rerender } = render(<Demo value="a" />);
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    // The parent hasn't accepted the change, so A stays selected.
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Demo value="b" />);
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
  });

  it('uncontrolled Accordion keeps its own state and reports it', async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="multiple" defaultValue={['a']} onValueChange={onValueChange}>
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
        <AccordionItem value="b" title="B">
          b
        </AccordionItem>
      </Accordion>,
    );
    await userEvent.click(screen.getByText('B'));
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
  });
});

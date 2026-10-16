import { useRef, useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Button, Popconfirm, Popover, type PopconfirmProps } from '../src';

// jsdom has no PointerEvent; Popover's light dismiss listens for pointerdown.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number;
      pointerType: string;
      isPrimary: boolean;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? 'mouse';
        this.isPrimary = init.isPrimary ?? true;
      }
    }
    window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
  }
});

const tick = () => act(() => new Promise((r) => setTimeout(r, 10)));

function deferred() {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(props: Partial<PopconfirmProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(
    <>
      <Popconfirm title="Archive this log?" message="It moves to the archive." onConfirm={onConfirm} onCancel={onCancel} {...props}>
        <Button>Archive</Button>
      </Popconfirm>
      <p>Plain text outside</p>
      <button type="button">Other control</button>
    </>,
  );
  const trigger = screen.getByRole('button', { name: 'Archive' });
  return { user, trigger, onConfirm, onCancel };
}

const dialog = () => screen.queryByRole('alertdialog');

describe('Popconfirm', () => {
  it('opens an alertdialog named by the title and described by the message, focusing Cancel', async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    const panel = screen.getByRole('alertdialog', { name: 'Archive this log?' });
    expect(panel).toHaveAccessibleDescription('It moves to the archive.');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('focuses Confirm with initialFocus="confirm"', async () => {
    const { user, trigger } = setup({ initialFocus: 'confirm' });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('opens from the keyboard and Tab moves between Cancel and Confirm', async () => {
    const { user, trigger, onConfirm } = setup();
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    await user.keyboard(' ');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('Cancel calls onCancel, closes and returns focus to the trigger', async () => {
    const { user, trigger, onCancel, onConfirm } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('Escape cancels and returns focus to the trigger', async () => {
    const { user, trigger, onCancel } = setup();
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('an outside click on a non-focusable area cancels and returns focus to the trigger', async () => {
    const { user, trigger, onCancel } = setup();
    await user.click(trigger);
    await user.click(screen.getByText('Plain text outside'));
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('an outside click on another control cancels but leaves focus on that control', async () => {
    const { user, trigger, onCancel } = setup();
    await user.click(trigger);
    const other = screen.getByRole('button', { name: 'Other control' });
    await user.click(other);
    await tick();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(other).toHaveFocus();
  });

  it('clicking the trigger again cancels', async () => {
    const { user, trigger, onCancel } = setup();
    await user.click(trigger);
    await user.click(trigger);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
  });

  it('a synchronous onConfirm closes without calling onCancel', async () => {
    const { user, trigger, onCancel, onConfirm } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(dialog()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('an async onConfirm shows loading and stays open, ignoring Escape and outside clicks, until it resolves', async () => {
    const d = deferred();
    const { user, trigger, onCancel } = setup({ onConfirm: () => d.promise, loadingText: 'Archiving' });
    await user.click(trigger);
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirm);
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(confirm).toHaveAttribute('aria-disabled', 'true');
    expect(confirm).toHaveTextContent('Archiving');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Plain text outside'));
    await tick();
    expect(dialog()).toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
    await act(async () => d.resolve());
    expect(dialog()).not.toBeInTheDocument();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('a rejected onConfirm shows the error inline and keeps it open for a retry', async () => {
    let attempt = 0;
    const onConfirm = vi.fn(() => (++attempt === 1 ? Promise.reject(new Error('Network unreachable')) : Promise.resolve()));
    const { user, trigger } = setup({ onConfirm });
    await user.click(trigger);
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirm);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network unreachable');
    expect(confirm).not.toHaveAttribute('aria-busy');
    expect(confirm).toHaveAccessibleDescription('Network unreachable');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(confirm);
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it('shows errorText, or a default, and clears the error when reopened', async () => {
    const { user, trigger } = setup({
      onConfirm: () => {
        throw 0;
      },
    });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Try again.');
    await user.keyboard('{Escape}');
    await user.click(trigger);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('errorText can be a function of the error', async () => {
    const { user, trigger } = setup({
      onConfirm: () => Promise.reject(new Error('503')),
      errorText: (e) => `Could not archive (${(e as Error).message}).`,
    });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not archive (503).');
  });

  it('danger variant uses a danger confirm button and a warning icon; labels are customizable', async () => {
    const { user, trigger } = setup({ variant: 'danger', confirmLabel: 'Archive log', cancelLabel: 'Keep it' });
    await user.click(trigger);
    const panel = screen.getByRole('alertdialog', { name: 'Archive this log?' });
    expect(screen.getByRole('button', { name: 'Archive log' })).toHaveAttribute('data-color', 'danger');
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
    const icon = panel.querySelector('.os-popconfirm__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('default variant uses a primary confirm button and no icon', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('data-color', 'primary');
    expect(screen.getByRole('alertdialog').querySelector('.os-popconfirm__icon')).toBeNull();
  });

  it('works controlled', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Popconfirm
            title="Archive?"
            open={open}
            onOpenChange={(o) => {
              onOpenChange(o);
              setOpen(o);
            }}
          >
            <Button>Archive</Button>
          </Popconfirm>
          <span data-testid="state">{String(open)}</span>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('a controlled open={true} that the parent never closes stays open', async () => {
    const user = userEvent.setup();
    render(
      <Popconfirm title="Archive?" open>
        <Button>Archive</Button>
      </Popconfirm>,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(dialog()).toBeInTheDocument();
  });

  it('has no axe violations while open, with an error showing', async () => {
    const { user, trigger } = setup({ variant: 'danger', onConfirm: () => Promise.reject(new Error('Offline')) });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await screen.findByRole('alert');
    const result = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});

describe('Popover focus props', () => {
  it('keeps today’s output by default: role="dialog", no description, focus left on the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover title="Info" content="Body">
        <button type="button">More</button>
      </Popover>,
    );
    await user.click(screen.getByText('More'));
    const panel = screen.getByRole('dialog', { name: 'Info' });
    expect(panel).not.toHaveAttribute('aria-describedby');
    expect(screen.getByText('More')).toHaveFocus();
  });

  it('takes role, aria-describedby and initialFocus', async () => {
    function Example() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Popover
          role="alertdialog"
          title="Leave?"
          aria-describedby="leave-msg"
          initialFocus={ref}
          content={
            <>
              <p id="leave-msg">Unsaved changes are lost.</p>
              <button ref={ref} type="button">
                Stay
              </button>
            </>
          }
        >
          <button type="button">Leave</button>
        </Popover>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByText('Leave'));
    expect(screen.getByRole('alertdialog', { name: 'Leave?' })).toHaveAccessibleDescription('Unsaved changes are lost.');
    expect(screen.getByRole('button', { name: 'Stay' })).toHaveFocus();
  });

  it('light dismiss leaves focus where the click put it unless returnFocusOnDismiss', async () => {
    function Example({ returnFocusOnDismiss }: { returnFocusOnDismiss?: boolean }) {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <>
          <Popover
            title="Info"
            returnFocusOnDismiss={returnFocusOnDismiss}
            initialFocus={ref}
            content={
              <button ref={ref} type="button">
                Inside
              </button>
            }
          >
            <button type="button">More</button>
          </Popover>
          <p>Outside</p>
        </>
      );
    }
    const user = userEvent.setup();
    const { rerender } = render(<Example />);
    await user.click(screen.getByText('More'));
    await user.click(screen.getByText('Outside'));
    await tick();
    expect(document.body).toHaveFocus();

    rerender(<Example returnFocusOnDismiss />);
    await user.click(screen.getByText('More'));
    expect(screen.getByText('Inside')).toHaveFocus();
    await user.click(screen.getByText('Outside'));
    await tick();
    expect(screen.getByText('More')).toHaveFocus();
  });
});

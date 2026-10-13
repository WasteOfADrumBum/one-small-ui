import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuCheckboxItem,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  type ContextMenuProps,
} from '../src';

// jsdom has no PointerEvent; React reads pointerType, pointerId and isPrimary from the native event.
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

afterEach(() => {
  vi.useRealTimers();
});

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

/** jsdom has no layout: give the target a real box so pointer positions fall inside it. */
function placeTarget(el: HTMLElement, rect = { top: 100, left: 50, width: 400, height: 60 }) {
  const r = { ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top };
  el.getBoundingClientRect = () => ({ ...r, toJSON: () => r }) as DOMRect;
}

const onRename = vi.fn();

function Demo(props: Partial<ContextMenuProps> & { onPaste?: () => void }) {
  const { onPaste, ...rest } = props;
  return (
    <>
      <button type="button">Elsewhere</button>
      <p data-testid="blank">Blank space</p>
      <ContextMenu {...rest}>
        <ContextMenuTrigger>
          <div role="region" tabIndex={0} aria-label="Mission log" data-testid="target">
            Mission log
            <button type="button">Row action</button>
            <input aria-label="Note" />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Log actions">
          <MenuItem onSelect={onRename}>Rename</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
          <MenuItem onSelect={onPaste}>Paste</MenuItem>
          <MenuDivider />
          <MenuCheckboxItem>Pinned</MenuCheckboxItem>
          <MenuRadioGroup label="Sort" defaultValue="date">
            <MenuRadioItem value="date">Date</MenuRadioItem>
            <MenuRadioItem value="name">Name</MenuRadioItem>
          </MenuRadioGroup>
          <MenuSub label="Share">
            <MenuItem>Copy link</MenuItem>
            <MenuItem>Email</MenuItem>
          </MenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

const target = () => screen.getByTestId('target');
const menu = () => screen.getByRole('menu', { name: 'Log actions' });
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('ContextMenu: opening', () => {
  it('opens on right-click at the pointer and prevents the native menu', async () => {
    render(<Demo />);
    placeTarget(target());
    const notCancelled = fireEvent.contextMenu(target(), { clientX: 120, clientY: 130, button: 2 });
    expect(notCancelled).toBe(false);
    expect(menu()).toHaveClass('os-floating', 'os-menu', 'os-context-menu');
    expect(item('Rename')).toHaveFocus();
    expect(target()).toHaveAttribute('data-state', 'open');
    // Placed at the point (bottom-start, 2px gap), not at the target's box.
    await waitFor(() => expect(menu().style.left).toBe('120px'));
    expect(menu().style.top).toBe('132px');
    expect(menu().style.getPropertyValue('--os-context-menu-max')).toMatch(/^\d+px$/);
  });

  it('keeps the target’s own role and adds no popup attributes', () => {
    render(<Demo />);
    expect(target()).toHaveAttribute('role', 'region');
    expect(target()).not.toHaveAttribute('aria-haspopup');
    expect(target()).toHaveAttribute('data-context-menu-trigger');
  });

  it('moves the menu on a second right-click and closes on a left press on the target', async () => {
    render(<Demo />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    await waitFor(() => expect(menu().style.left).toBe('120px'));
    fireEvent.pointerDown(target(), { button: 2, pointerType: 'mouse' });
    fireEvent.contextMenu(target(), { clientX: 300, clientY: 140 });
    await waitFor(() => expect(menu().style.left).toBe('300px'));
    fireEvent.pointerDown(target(), { button: 0, pointerType: 'mouse' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens with Shift+F10 at the focused element', async () => {
    render(<Demo />);
    placeTarget(target());
    target().focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(item('Rename')).toHaveFocus();
    await waitFor(() => expect(menu().style.left).toBe('50px'));
    expect(menu().style.top).toBe('162px');
  });

  it('opens with the ContextMenu key and ignores the contextmenu event that follows it', async () => {
    render(<Demo />);
    placeTarget(target());
    target().focus();
    await userEvent.keyboard('{ContextMenu}');
    expect(item('Rename')).toHaveFocus();
    await waitFor(() => expect(menu().style.left).toBe('50px'));
    // Windows sends a contextmenu on keyup; it must not reposition the menu.
    fireEvent.contextMenu(target(), { clientX: 300, clientY: 140 });
    await new Promise((r) => setTimeout(r, 20));
    expect(menu().style.left).toBe('50px');
  });

  it('anchors to the focused element for a keyboard-generated contextmenu event (no pointer position)', async () => {
    render(<Demo />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 0, clientY: 0 });
    await waitFor(() => expect(menu().style.left).toBe('50px'));
    expect(menu().style.top).toBe('162px');
  });

  it('opens from a focused descendant and returns focus to it', async () => {
    render(<Demo />);
    const row = screen.getByRole('button', { name: 'Row action' });
    row.focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(row).toHaveFocus();
  });

  it('leaves the native menu for text fields inside the target', async () => {
    render(<Demo />);
    const input = screen.getByRole('textbox', { name: 'Note' });
    expect(fireEvent.contextMenu(input, { clientX: 10, clientY: 10 })).toBe(true);
    input.focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('respects preventDefault from the child’s own onContextMenu', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button" data-testid="target" onContextMenu={(e) => e.preventDefault()}>
            Target
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Actions">
          <MenuItem>One</MenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(target(), { clientX: 10, clientY: 10 });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('prevents the native menu on the menu itself', () => {
    render(<Demo defaultOpen />);
    expect(fireEvent.contextMenu(item('Rename'))).toBe(false);
  });
});

describe('ContextMenu: long press', () => {
  const touch = (type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel', x = 100, y = 120) =>
    fireEvent[type](target(), { pointerType: 'touch', pointerId: 7, isPrimary: true, clientX: x, clientY: y });

  it('opens after the delay at the touch point and swallows the click and contextmenu that follow', async () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    render(<Demo />);
    target().addEventListener('click', onClick);
    placeTarget(target());
    touch('pointerDown');
    act(() => void vi.advanceTimersByTime(499));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(menu()).toBeInTheDocument();
    expect(item('Rename')).toHaveFocus();
    // Android follows with its own contextmenu: prevented, and the menu stays at the touch point.
    expect(fireEvent.contextMenu(target(), { clientX: 300, clientY: 140 })).toBe(false);
    touch('pointerUp');
    fireEvent.click(target());
    expect(onClick).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(20));
    expect(menu().style.left).toBe('100px');
  });

  it('honours longPressDelay', () => {
    vi.useFakeTimers();
    render(<Demo longPressDelay={800} />);
    placeTarget(target());
    touch('pointerDown');
    act(() => void vi.advanceTimersByTime(600));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(200));
    expect(menu()).toBeInTheDocument();
  });

  it('cancels when the touch moves more than 10px, lifts, is cancelled or the page scrolls', () => {
    vi.useFakeTimers();
    render(<Demo />);
    placeTarget(target());

    touch('pointerDown');
    touch('pointerMove', 105, 125); // within tolerance
    touch('pointerMove', 115, 120); // 15px: a scroll or drag
    act(() => void vi.advanceTimersByTime(600));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    touch('pointerDown');
    act(() => void vi.advanceTimersByTime(200));
    touch('pointerUp');
    act(() => void vi.advanceTimersByTime(600));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    touch('pointerDown');
    touch('pointerCancel');
    act(() => void vi.advanceTimersByTime(600));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    touch('pointerDown');
    fireEvent.scroll(window);
    act(() => void vi.advanceTimersByTime(600));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('ignores mouse presses and clears its timer on unmount', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { unmount } = render(<Demo onOpenChange={onOpenChange} />);
    fireEvent.pointerDown(target(), { pointerType: 'mouse', button: 0 });
    act(() => void vi.advanceTimersByTime(600));
    expect(onOpenChange).not.toHaveBeenCalled();
    touch('pointerDown');
    unmount();
    act(() => void vi.advanceTimersByTime(600));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('ContextMenu: closing and focus return', () => {
  it('Escape closes and returns focus to the target', async () => {
    render(<Demo />);
    placeTarget(target());
    target().focus();
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(target()).toHaveFocus();
    expect(target()).toHaveAttribute('data-state', 'closed');
  });

  it('an outside click on blank space closes and returns focus to the target', async () => {
    render(<Demo />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    await userEvent.click(screen.getByTestId('blank'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await waitFor(() => expect(target()).toHaveFocus());
  });

  it('an outside click on another control closes and leaves focus there', async () => {
    render(<Demo />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    await userEvent.click(elsewhere);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 10));
    expect(elsewhere).toHaveFocus();
  });

  it('selecting an item closes, runs it and returns focus; Tab closes too', async () => {
    onRename.mockClear();
    render(<Demo />);
    target().focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    await userEvent.keyboard('{Enter}');
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(target()).toHaveFocus();

    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    await userEvent.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('autoClose="inside" keeps it open on outside clicks', async () => {
    render(<Demo autoClose="inside" />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    await userEvent.click(screen.getByTestId('blank'));
    expect(menu()).toBeInTheDocument();
  });
});

describe('ContextMenu: Menu items and keyboard', () => {
  it('roving focus skips disabled items, wraps, and Home/End jump', async () => {
    render(<Demo />);
    target().focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Paste')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(item('Share')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Rename')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(item('Share')).toHaveFocus();
    expect(item('Delete')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('typeahead jumps to the next matching item', async () => {
    render(<Demo />);
    target().focus();
    await userEvent.keyboard('{ContextMenu}');
    await userEvent.keyboard('p');
    expect(item('Paste')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Pinned' })).toHaveFocus();
    await new Promise((r) => setTimeout(r, 650));
    await userEvent.keyboard('s');
    expect(item('Share')).toHaveFocus();
  });

  it('ArrowRight opens a submenu and ArrowLeft closes it', async () => {
    render(<Demo />);
    target().focus();
    await userEvent.keyboard('{ContextMenu}{End}');
    const share = item('Share');
    expect(share).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.keyboard('{ArrowRight}');
    expect(share).toHaveAttribute('aria-expanded', 'true');
    expect(item('Copy link')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Email')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(share).toHaveFocus();
    expect(share).toHaveAttribute('aria-expanded', 'false');
    // Escape in a submenu closes only the submenu.
    await userEvent.keyboard('{ArrowRight}{Escape}');
    expect(share).toHaveFocus();
    expect(menu()).toBeInTheDocument();
  });

  it('checkbox and radio items toggle and keep the menu open', async () => {
    render(<Demo />);
    target().focus();
    await userEvent.keyboard('{ContextMenu}');
    const pinned = screen.getByRole('menuitemcheckbox', { name: 'Pinned' });
    expect(pinned).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(pinned);
    expect(pinned).toHaveAttribute('aria-checked', 'true');
    const byName = screen.getByRole('menuitemradio', { name: 'Name' });
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'true');
    byName.focus();
    await userEvent.keyboard('{Enter}');
    expect(byName).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'false');
    expect(menu()).toBeInTheDocument();
  });
});

describe('ContextMenu: disabled', () => {
  it('attaches nothing, so the native menu shows and keys do nothing', async () => {
    const onOpenChange = vi.fn();
    render(<Demo disabled onOpenChange={onOpenChange} />);
    expect(target()).not.toHaveAttribute('data-context-menu-trigger');
    expect(fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 })).toBe(true);
    target().focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}{ContextMenu}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes an open menu when it becomes disabled', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    expect(menu()).toBeInTheDocument();
    rerender(<Demo defaultOpen disabled onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('ContextMenu: open state', () => {
  it('uncontrolled: defaultOpen renders it open at the target, onOpenChange reports changes', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    expect(menu()).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('controlled: follows the open prop and asks through onOpenChange', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Show actions
          </button>
          <span data-testid="state">{String(open)}</span>
          <Demo open={open} onOpenChange={setOpen} />
        </>
      );
    }
    render(<Controlled />);
    placeTarget(target());
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    expect(menu()).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByTestId('state')).toHaveTextContent('false');

    // Opened from elsewhere: anchored to the target, not the last pointer position.
    await userEvent.click(screen.getByRole('button', { name: 'Show actions' }));
    await waitFor(() => expect(menu().style.left).toBe('50px'));
    expect(menu().style.top).toBe('162px');
  });

  it('controlled: stays closed when the parent ignores the request', () => {
    const onOpenChange = vi.fn();
    render(<Demo open={false} onOpenChange={onOpenChange} />);
    fireEvent.contextMenu(target(), { clientX: 120, clientY: 130 });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('ContextMenu: accessibility', () => {
  it('has no axe violations open, in light and dark', async () => {
    const { container } = render(<Demo defaultOpen />);
    expect(menu()).toHaveAttribute('aria-label', 'Log actions');
    await expectNoAxeViolations(container.ownerDocument.body);
  });

  it('is labelled by the target when no aria-label is given', () => {
    render(
      <ContextMenu defaultOpen>
        <ContextMenuTrigger>
          <button type="button">Cargo bay</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <MenuGroup label="Cargo">
            <MenuItem>Inspect</MenuItem>
          </MenuGroup>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByRole('menu', { name: 'Cargo bay' })).toBeInTheDocument();
  });
});

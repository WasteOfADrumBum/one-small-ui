import { forwardRef, useState, type AnchorHTMLAttributes } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette, type CommandGroup, type CommandItem, type CommandPaletteProps } from '../src/components/CommandPalette';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { fuzzyFilter, fuzzyMatch } from '../src/utils/fuzzy';

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

const onAction = vi.fn();

const groups: CommandGroup[] = [
  {
    heading: 'Actions',
    items: [
      { id: 'new', label: 'New file', shortcut: 'Mod+N', onSelect: onAction },
      { id: 'settings', label: 'Open settings', keywords: ['preferences', 'config'], description: 'Change how the app works', onSelect: onAction },
      { id: 'locked', label: 'Delete workspace', disabled: true, onSelect: onAction },
      {
        id: 'theme',
        label: 'Change theme',
        placeholder: 'Pick a theme…',
        children: [
          { id: 'light', label: 'Light theme', onSelect: onAction },
          { id: 'dark', label: 'Dark theme', onSelect: onAction },
        ],
      },
    ],
  },
  {
    heading: 'Navigation',
    items: [
      { id: 'home', label: 'Go home', href: '#home' },
      { id: 'docs', label: 'Read the docs', href: '#docs' },
    ],
  },
];

function Palette(props: Partial<CommandPaletteProps>) {
  return (
    <>
      <button type="button">Opener</button>
      <CommandPalette groups={groups} {...props} />
    </>
  );
}

const input = () => screen.getByRole('combobox', { name: 'Search commands' });
const active = () => {
  const id = input().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};
const optionNames = () => screen.queryAllByRole('option').map((o) => o.getAttribute('aria-label'));

beforeEach(() => {
  onAction.mockClear();
  window.localStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe('fuzzyMatch', () => {
  it('matches subsequences case-insensitively and returns indices', () => {
    expect(fuzzyMatch('opset', 'Open settings')?.indices).toEqual([0, 1, 5, 6, 7]);
    expect(fuzzyMatch('OS', 'open settings')?.indices).toEqual([0, 5]);
    expect(fuzzyMatch('xyz', 'Open settings')).toBeNull();
    expect(fuzzyMatch('settingsx', 'settings')).toBeNull();
  });

  it('ignores whitespace in the query and matches an empty query', () => {
    expect(fuzzyMatch('op set', 'Open settings')).not.toBeNull();
    expect(fuzzyMatch('', 'anything')).toEqual({ score: 0, indices: [] });
  });

  it('prefers word starts, consecutive runs and prefixes', () => {
    const score = (q: string, t: string) => fuzzyMatch(q, t)!.score;
    expect(score('ct', 'Change theme')).toBeGreaterThan(score('ct', 'Account'));
    expect(score('set', 'Settings')).toBeGreaterThan(score('set', 'Sunset'));
    expect(score('dark', 'Dark')).toBeGreaterThan(score('dark', 'Dark mode'));
    // camelCase humps count as word starts.
    expect(fuzzyMatch('dt', 'DataTable')?.indices).toEqual([0, 4]);
  });
});

describe('fuzzyFilter', () => {
  const list = [{ name: 'Sunset' }, { name: 'Settings', tags: ['prefs'] }, { name: 'Profile' }];
  it('filters and sorts best first, matching keywords too', () => {
    const r = fuzzyFilter(list, 'set', { getText: (i) => i.name, getKeywords: (i) => i.tags });
    expect(r.map((x) => x.item.name)).toEqual(['Settings', 'Sunset']);
    expect(fuzzyFilter(list, 'prefs', { getText: (i) => i.name, getKeywords: (i) => i.tags }).map((x) => x.item.name)).toEqual(['Settings']);
  });
  it('returns everything in order for an empty query', () => {
    expect(fuzzyFilter(['b', 'a'], '').map((x) => x.item)).toEqual(['b', 'a']);
  });
});

describe('CommandPalette: opening and focus', () => {
  it('opens with Mod+K, focuses the input, and returns focus on close', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    const opener = screen.getByRole('button', { name: 'Opener' });
    opener.focus();
    fireEvent.keyDown(opener, { key: 'k', ctrlKey: true });
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(dialog).toHaveAttribute('open');
    expect(input()).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('toggles closed with the hotkey, and works from inside text fields', async () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <CommandPalette groups={groups} />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText('Elsewhere'), { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    fireEvent.keyDown(input(), { key: 'k', ctrlKey: true });
    await waitFor(() => expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open'));
  });

  it('takes a custom hotkey, and hotkey={false} turns it off', () => {
    const { rerender } = render(<Palette hotkey="Mod+P" />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
    fireEvent.keyDown(document.body, { key: 'p', ctrlKey: true });
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    rerender(<Palette hotkey={false} defaultOpen={false} />);
    fireEvent.keyDown(input(), { key: 'p', ctrlKey: true });
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('a bare-key hotkey does not fire while typing in a field', () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <CommandPalette groups={groups} hotkey="/" />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText('Elsewhere'), { key: '/' });
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
    fireEvent.keyDown(document.body, { key: '/' });
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('closes with the close button and calls onOpenChange', async () => {
    const onOpenChange = vi.fn();
    render(<Palette defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close command palette' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('is controllable', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Search
          </button>
          <span data-testid="state">{String(open)}</span>
          <CommandPalette open={open} onOpenChange={setOpen} groups={groups} hotkey={false} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(input()).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('state')).toHaveTextContent('false');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus());
  });
});

describe('CommandPalette: ARIA', () => {
  it('wires the combobox, listbox, groups and options', () => {
    render(<Palette defaultOpen />);
    const cb = input();
    const listbox = screen.getByRole('listbox', { name: 'Results' });
    expect(cb).toHaveAttribute('aria-expanded', 'true');
    expect(cb).toHaveAttribute('aria-controls', listbox.id);
    expect(cb).toHaveAttribute('aria-autocomplete', 'list');
    expect(cb).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'New file' }).id);
    expect(screen.getByRole('option', { name: 'New file' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Open settings' })).toHaveAttribute('aria-selected', 'false');
    const actions = screen.getByRole('group', { name: 'Actions' });
    expect(within(actions).getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('group', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Delete workspace' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows shortcuts with Kbd and describes options with their description and shortcut', () => {
    render(<Palette defaultOpen />);
    const newFile = screen.getByRole('option', { name: 'New file' });
    expect(newFile.querySelector('kbd.os-kbd')).not.toBeNull();
    expect(newFile).toHaveAccessibleDescription('Control N');
    expect(screen.getByRole('option', { name: 'Open settings' })).toHaveAccessibleDescription('Change how the app works');
  });

  it('highlights matched characters without changing the accessible name', async () => {
    render(<Palette defaultOpen />);
    await userEvent.type(input(), 'opset');
    const option = screen.getByRole('option', { name: 'Open settings' });
    expect(Array.from(option.querySelectorAll('mark')).map((m) => m.textContent)).toEqual(['Op', 'set']);
    expect(option.querySelector('.os-command-palette__item-label')).toHaveTextContent('Open settings');
  });

  it('has no axe violations in light and dark, also on a nested page and while loading', async () => {
    const { container, unmount } = render(<Palette defaultOpen />);
    await expectNoAxeViolations(container);
    await userEvent.type(input(), 'set');
    await expectNoAxeViolations(container);
    await userEvent.clear(input());
    fireEvent.click(screen.getByRole('option', { name: 'Change theme' }));
    await expectNoAxeViolations(container);
    unmount();
    const slow = render(<CommandPalette defaultOpen loadItems={() => new Promise(() => {})} />);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    await expectNoAxeViolations(slow.container);
  });
});

describe('CommandPalette: filtering', () => {
  it('filters by label and keywords, keeping group headings', async () => {
    render(<Palette defaultOpen />);
    await userEvent.type(input(), 'preferences');
    expect(optionNames()).toEqual(['Open settings']);
    expect(screen.getByRole('group', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Navigation' })).toBeNull();
  });

  it('ranks the best group first', async () => {
    render(<Palette defaultOpen />);
    await userEvent.type(input(), 'docs');
    expect(optionNames()[0]).toBe('Read the docs');
    expect(active()).toHaveAttribute('aria-label', 'Read the docs');
  });

  it('shows the empty state and collapses the listbox', async () => {
    render(<Palette defaultOpen emptyState={(q) => `Nothing for ${q}`} />);
    await userEvent.type(input(), 'zzzz');
    expect(screen.getByText('Nothing for zzzz')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).not.toHaveAttribute('aria-activedescendant');
  });

  it('takes a custom filter, or none', async () => {
    const { rerender } = render(<Palette defaultOpen filter={(item, q) => item.id.startsWith(q)} />);
    await userEvent.type(input(), 'd');
    expect(optionNames()).toEqual(['Read the docs']);
    rerender(<Palette defaultOpen filter={false} />);
    expect(optionNames()).toHaveLength(6);
  });

  it('flat items group by their group key', () => {
    const items: CommandItem[] = [
      { id: 'a', label: 'Alpha', group: 'One' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma', group: 'One' },
    ];
    render(<CommandPalette defaultOpen items={items} />);
    expect(within(screen.getByRole('group', { name: 'One' })).getAllByRole('option')).toHaveLength(2);
    expect(optionNames()).toEqual(['Alpha', 'Gamma', 'Beta']);
  });

  it('controls the query', async () => {
    function Controlled() {
      const [query, setQuery] = useState('home');
      return <CommandPalette defaultOpen groups={groups} query={query} onQueryChange={setQuery} />;
    }
    render(<Controlled />);
    expect(input()).toHaveValue('home');
    expect(optionNames()).toEqual(['Go home']);
    await userEvent.clear(input());
    expect(optionNames()).toHaveLength(6);
  });

  it('uses defaultQuery and renderItem', () => {
    render(
      <CommandPalette
        defaultOpen
        groups={groups}
        defaultQuery="new"
        renderItem={(item, { active, label }) => (
          <span data-testid={`row-${item.id}`} data-active={active || undefined}>
            {label}!
          </span>
        )}
      />,
    );
    expect(screen.getByTestId('row-new')).toHaveTextContent('New file!');
    expect(screen.getByRole('option', { name: 'New file' })).toContainElement(screen.getByTestId('row-new'));
  });
});

describe('CommandPalette: keyboard', () => {
  it('ArrowDown and ArrowUp move, skip disabled items and wrap', async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen />);
    expect(active()).toHaveAttribute('aria-label', 'New file');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveAttribute('aria-label', 'Open settings');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveAttribute('aria-label', 'Change theme');
    await user.keyboard('{ArrowUp}');
    expect(active()).toHaveAttribute('aria-label', 'Open settings');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(active()).toHaveAttribute('aria-label', 'Read the docs');
    await user.keyboard('{ArrowDown}');
    expect(active()).toHaveAttribute('aria-label', 'New file');
  });

  it('Home and End jump to the first and last enabled item', async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        defaultOpen
        items={[
          { id: 'x', label: 'Off first', disabled: true },
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Beta' },
          { id: 'y', label: 'Off last', disabled: true },
        ]}
      />,
    );
    await user.keyboard('{End}');
    expect(active()).toHaveAttribute('aria-label', 'Beta');
    await user.keyboard('{Home}');
    expect(active()).toHaveAttribute('aria-label', 'Alpha');
  });

  it('Enter selects the active item and closes', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Palette defaultOpen onSelect={onSelect} />);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'settings' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'settings' }));
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('clicking selects, disabled items do nothing, and mouse hover moves the active item', async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen />);
    await user.hover(screen.getByRole('option', { name: 'Go home' }));
    expect(active()).toHaveAttribute('aria-label', 'Go home');
    await user.click(screen.getByRole('option', { name: 'Delete workspace' }));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    await user.click(screen.getByRole('option', { name: 'New file' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('closeOnSelect={false} keeps it open', async () => {
    render(<Palette defaultOpen closeOnSelect={false} />);
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('Escape closes from the top level', async () => {
    const onOpenChange = vi.fn();
    render(<Palette defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('CommandPalette: nested pages', () => {
  it('opens a page, shows the breadcrumb, and goes back with Escape and Backspace', async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen />);
    await user.type(input(), 'theme{Enter}');
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('placeholder', 'Pick a theme…');
    expect(optionNames()).toEqual(['Light theme', 'Dark theme']);
    const crumbs = screen.getByRole('navigation', { name: 'Command pages' });
    expect(within(crumbs).getByText('Change theme')).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(document.querySelector('[data-os-announcer="polite"]')).toHaveTextContent('Change theme. 2 results'), {
      timeout: 1500,
    });

    // Escape goes back a page first, with the parent item active again.
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(screen.queryByRole('navigation', { name: 'Command pages' })).toBeNull();
    expect(active()).toHaveAttribute('aria-label', 'Change theme');

    // Backspace on an empty input goes back; with text it just deletes.
    await user.keyboard('{Enter}');
    expect(optionNames()).toEqual(['Light theme', 'Dark theme']);
    await user.type(input(), 'd');
    await user.keyboard('{Backspace}');
    expect(input()).toHaveValue('');
    expect(optionNames()).toEqual(['Light theme', 'Dark theme']);
    await user.keyboard('{Backspace}');
    expect(optionNames()).toContain('New file');
  });

  it('breadcrumb buttons go back, and the page selection works', async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen />);
    await user.click(screen.getByRole('option', { name: 'Change theme' }));
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(optionNames()).toContain('New file');
    expect(input()).toHaveFocus();
    await user.click(screen.getByRole('option', { name: 'Change theme' }));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'dark' }));
  });

  it('resets to the top level when reopened', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    await user.click(screen.getByRole('option', { name: 'Change theme' }));
    fireEvent.keyDown(input(), { key: 'k', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    await waitFor(() => expect(optionNames()).toContain('New file'));
  });
});

describe('CommandPalette: links', () => {
  it('renders href items as links and follows them on Enter', async () => {
    const user = userEvent.setup();
    render(<Palette defaultOpen />);
    const home = screen.getByRole('option', { name: 'Go home' });
    expect(home.tagName).toBe('A');
    expect(home).toHaveAttribute('href', '#home');
    await user.type(input(), 'home{Enter}');
    expect(window.location.hash).toBe('#home');
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('passes option props to `as` and `render` (router links)', async () => {
    const navigate = vi.fn();
    const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink(
      { onClick, href, children, ...props },
      ref,
    ) {
      return (
        <a
          ref={ref}
          href={href}
          data-router=""
          {...props}
          onClick={(e) => {
            onClick?.(e);
            e.preventDefault();
            navigate(href);
          }}
        >
          {children}
        </a>
      );
    });
    const user = userEvent.setup();
    render(
      <CommandPalette
        defaultOpen
        items={[
          { id: 'a', label: 'With as', href: '/a', as: RouterLink },
          { id: 'b', label: 'With render', href: '/b', render: (props) => <RouterLink {...props} data-render="" /> },
        ]}
      />,
    );
    const a = screen.getByRole('option', { name: 'With as' });
    expect(a).toHaveAttribute('data-router');
    expect(screen.getByRole('option', { name: 'With render' })).toHaveAttribute('data-render');
    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/a');
  });
});

describe('CommandPalette: recent items', () => {
  it('stores chosen items and lists them first next time', async () => {
    const user = userEvent.setup();
    render(<Palette recent={{ storageKey: 'cmdk-test', max: 2 }} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('group', { name: 'Recent' })).toBeNull();
    await user.click(screen.getByRole('option', { name: 'Open settings' }));
    expect(JSON.parse(window.localStorage.getItem('cmdk-test')!)).toEqual(['settings']);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    const recent = await screen.findByRole('group', { name: 'Recent' });
    expect(within(recent).getAllByRole('option').map((o) => o.getAttribute('aria-label'))).toEqual(['Open settings']);
    // Nested items can be recent too; the list is capped at `max`.
    await user.click(screen.getByRole('option', { name: 'Change theme' }));
    await user.click(screen.getByRole('option', { name: 'Light theme' }));
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    await user.click(screen.getAllByRole('option', { name: 'New file' })[0]!);
    expect(JSON.parse(window.localStorage.getItem('cmdk-test')!)).toEqual(['new', 'light']);
  });

  it('hides recents while searching and survives broken storage', async () => {
    window.localStorage.setItem('cmdk-bad', '{not json');
    render(<Palette defaultOpen recent={{ storageKey: 'cmdk-bad', label: 'Lately' }} />);
    expect(screen.queryByRole('group', { name: 'Lately' })).toBeNull();
    window.localStorage.setItem('cmdk-good', '["home","gone"]');
    const { unmount } = render(<CommandPalette defaultOpen groups={groups} recent={{ storageKey: 'cmdk-good', label: 'Lately' }} />);
    expect(await screen.findByRole('group', { name: 'Lately' })).toBeInTheDocument();
    await userEvent.type(screen.getAllByRole('combobox')[1]!, 'home');
    expect(screen.queryByRole('group', { name: 'Lately' })).toBeNull();
    unmount();
  });
});

describe('CommandPalette: async', () => {
  it('debounces, shows loading with aria-busy, and aborts stale requests', async () => {
    const signals: AbortSignal[] = [];
    const loadItems = vi.fn((query: string, { signal }: { signal: AbortSignal }) => {
      signals.push(signal);
      return new Promise<CommandGroup[]>((resolve) =>
        setTimeout(() => resolve([{ heading: 'Users', items: [{ id: `u-${query}`, label: `User ${query || 'all'}` }] }]), 30),
      );
    });
    const user = userEvent.setup();
    render(<CommandPalette defaultOpen items={[{ id: 'static', label: 'Static item' }]} loadItems={loadItems} debounce={20} />);
    expect(screen.getByText('Loading results')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(await screen.findByRole('option', { name: 'User all' })).toBeInTheDocument();
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('group', { name: 'Users' })).toBeInTheDocument();
    loadItems.mockClear();
    await user.type(input(), 'ada');
    expect(await screen.findByRole('option', { name: 'User ada' })).toBeInTheDocument();
    // Typing fast: only the settled query loads; any request started earlier was aborted.
    expect(loadItems.mock.calls.map((c) => c[0])).toEqual(['ada']);
    expect(signals.slice(0, -1).every((s) => s.aborted)).toBe(true);
  });

  it('shows and announces an error when loading fails', async () => {
    const { container } = render(
      <AnnouncerProvider>
        <CommandPalette defaultOpen loadItems={() => Promise.reject(new Error('nope'))} debounce={0} />
      </AnnouncerProvider>,
    );
    await userEvent.type(input(), 'x');
    expect(await screen.findByText('Results could not be loaded.')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('[data-os-announcer="assertive"]')).toHaveTextContent('Results could not be loaded.'), {
      timeout: 1500,
    });
  });
});

describe('CommandPalette: announcements', () => {
  it('announces the result count once typing settles, not on every keystroke', () => {
    vi.useFakeTimers();
    const { container } = render(
      <AnnouncerProvider>
        <Palette defaultOpen />
      </AnnouncerProvider>,
    );
    const region = container.querySelector<HTMLElement>('[data-os-announcer="polite"]')!;
    act(() => vi.advanceTimersByTime(1000));
    expect(region).toBeEmptyDOMElement();
    fireEvent.change(input(), { target: { value: 's' } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(input(), { target: { value: 'se' } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(input(), { target: { value: 'set' } });
    act(() => vi.advanceTimersByTime(300));
    expect(region).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(400));
    expect(region).toHaveTextContent('1 result');
    fireEvent.change(input(), { target: { value: 'zzz' } });
    act(() => vi.advanceTimersByTime(700));
    expect(region).toHaveTextContent('No results');
    fireEvent.change(input(), { target: { value: 'e' } });
    act(() => vi.advanceTimersByTime(700));
    expect(region.textContent).toMatch(/^\d+ results$/);
  });
});
